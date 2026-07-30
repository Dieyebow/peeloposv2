#!/bin/bash

# ====================================================================
# SCRIPT DE DÉPLOIEMENT AUTOMATIQUE - PEELO POS
# ====================================================================

# 🔧 CONFIGURATION
# ====================================================================
EC2_USER="root"
EC2_HOST="168.119.125.171"
KEY_PATH="/Users/peeloincceo/.ssh/id_ed25519_hetzner"
EC2_PATH="/root/apps/pos.peelo.shop"
WEB_SERVER="nginx"
BACKUP_DIR="/root/apps/pos.peelo.shop.backups"
APP_NAME="Peelo POS"
APP_URL="https://pos.peelo.shop"

# ====================================================================
# NE MODIFIEZ PAS EN DESSOUS DE CETTE LIGNE
# ====================================================================

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error()   { echo -e "${RED}❌ $1${NC}"; }
log_step()    { echo -e "${PURPLE}🔄 $1${NC}"; }

# Vérification des prérequis
check_prerequisites() {
    log_step "Vérification des prérequis..."

    if [[ -z "$EC2_HOST" ]]; then
        log_error "Veuillez configurer EC2_HOST dans le script"
        exit 1
    fi

    if [[ -z "$KEY_PATH" ]]; then
        log_error "Veuillez configurer KEY_PATH dans le script"
        exit 1
    fi

    if [ ! -f "$KEY_PATH" ]; then
        log_error "Clé SSH non trouvée: $KEY_PATH"
        exit 1
    fi

    chmod 400 "$KEY_PATH" 2>/dev/null || {
        log_error "Impossible de modifier les permissions de la clé SSH"
        exit 1
    }

    if ! command -v rsync &> /dev/null; then
        log_error "rsync n'est pas installé. Installez-le avec: brew install rsync"
        exit 1
    fi

    log_success "Tous les prérequis sont satisfaits"
}

# Test connexion SSH
test_ssh_connection() {
    log_step "Test de la connexion SSH..."

    ssh -i "$KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'OK'" &> /dev/null

    if [ $? -ne 0 ]; then
        log_error "Impossible de se connecter au serveur. Vérifiez :"
        log_info "- Adresse: $EC2_HOST"
        log_info "- Utilisateur: $EC2_USER"
        log_info "- Clé SSH: $KEY_PATH"
        exit 1
    fi

    log_success "Connexion SSH établie avec $EC2_USER@$EC2_HOST"
}

# Déploiement principal
deploy() {
    echo ""
    echo -e "${CYAN}=====================================================================${NC}"
    echo -e "${CYAN}🚀 DÉPLOIEMENT $APP_NAME VERS SERVEUR${NC}"
    echo -e "${CYAN}=====================================================================${NC}"
    echo ""

    log_info "Serveur cible: $EC2_USER@$EC2_HOST"
    log_info "Destination: $EC2_PATH"
    log_info "URL: $APP_URL"
    echo ""

    # Étape 1: Vérifications
    check_prerequisites
    test_ssh_connection

    # Étape 2: Build Vite
    echo ""
    log_step "Build du projet (Vite + React)..."
    npm run build

    if [ $? -ne 0 ]; then
        log_error "Échec du build"
        exit 1
    fi

    log_success "Build terminé avec succès"

    # Étape 3: Vérification du dossier dist
    if [ ! -d "dist" ]; then
        log_error "Le dossier dist n'existe pas"
        exit 1
    fi

    local file_count=$(find dist -type f | wc -l)
    log_info "Nombre de fichiers à déployer: $file_count"

    # Étape 4: Préparation serveur et backup
    echo ""
    log_step "Préparation du serveur et backup..."

    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    local temp_upload_path="/tmp/peelo-pos-upload-$(date +%s)"

    ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
        # Créer le répertoire de backup
        mkdir -p $BACKUP_DIR

        # Backup de l'ancienne version si elle existe
        if [ -d '$EC2_PATH' ] && [ \"\$(ls -A $EC2_PATH 2>/dev/null)\" ]; then
            echo 'Backup de l ancienne version...'
            cp -r $EC2_PATH $BACKUP_DIR/$backup_name
            echo 'Backup créé: $BACKUP_DIR/$backup_name'
        fi

        # Créer le répertoire temporaire
        mkdir -p $temp_upload_path
        chmod 755 $temp_upload_path

        # Créer le répertoire de destination
        mkdir -p $EC2_PATH
    "

    if [ $? -eq 0 ]; then
        log_success "Serveur préparé et backup créé"
    else
        log_error "Échec de la préparation du serveur"
        exit 1
    fi

    # Étape 5: Upload vers répertoire temporaire
    echo ""
    log_step "Upload des fichiers vers le serveur..."

    rsync -avz --progress \
        -e "ssh -i $KEY_PATH -o StrictHostKeyChecking=no" \
        dist/ "$EC2_USER@$EC2_HOST:$temp_upload_path/"

    if [ $? -ne 0 ]; then
        log_error "Échec de l'upload des fichiers"
        ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" "rm -rf $temp_upload_path"
        exit 1
    fi

    log_success "Fichiers uploadés"

    # Étape 6: Déploiement atomique
    echo ""
    log_step "Déploiement des fichiers..."

    ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" "
        # Vider la destination
        rm -rf $EC2_PATH/*

        # Copier les nouveaux fichiers
        cp -r $temp_upload_path/* $EC2_PATH/

        # Nettoyer le temporaire
        rm -rf $temp_upload_path

        # Permissions
        chmod -R 755 $EC2_PATH
    "

    if [ $? -ne 0 ]; then
        log_error "Échec du déploiement"
        log_warning "Tentative de restauration du backup..."

        ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" "
            if [ -d '$BACKUP_DIR/$backup_name' ]; then
                rm -rf $EC2_PATH/*
                cp -r $BACKUP_DIR/$backup_name/* $EC2_PATH/
                echo 'Backup restauré'
            fi
        "
        exit 1
    fi

    log_success "Fichiers déployés avec succès"

    # Étape 7: Reload Nginx
    echo ""
    log_step "Reload du serveur web ($WEB_SERVER)..."

    ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" "systemctl reload $WEB_SERVER 2>/dev/null || service $WEB_SERVER reload 2>/dev/null"

    if [ $? -eq 0 ]; then
        log_success "Serveur web rechargé"
    else
        log_warning "Attention: impossible de recharger le serveur web"
    fi

    # Étape 8: Vérification finale
    echo ""
    log_step "Vérification finale..."

    local remote_file_count=$(ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" "find $EC2_PATH -type f | wc -l" 2>/dev/null)

    if [ "$remote_file_count" -gt 0 ]; then
        log_success "Déploiement vérifié: $remote_file_count fichiers sur le serveur"
    fi

    # Résumé final
    echo ""
    echo -e "${CYAN}=====================================================================${NC}"
    echo -e "${GREEN}🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
    echo -e "${CYAN}=====================================================================${NC}"
    echo ""
    log_success "$APP_NAME est maintenant en ligne"
    log_info "URL: $APP_URL"
    log_info "Backup: $BACKUP_DIR/$backup_name"
    echo ""
}

# Lister les backups
list_backups() {
    log_step "Liste des backups disponibles..."

    ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "
        if [ -d '$BACKUP_DIR' ]; then
            echo ''
            echo 'BACKUPS DISPONIBLES:'
            echo ''
            ls -la $BACKUP_DIR | grep '^d' | grep backup- | while read line; do
                backup_name=\$(echo \$line | awk '{print \$9}')
                backup_date=\$(echo \$line | awk '{print \$6, \$7, \$8}')
                echo '  📦 '\$backup_name' - '\$backup_date
            done
            echo ''
        else
            echo 'Aucun backup trouvé'
        fi
    "
}

# Restaurer un backup
rollback() {
    local backup_name="$1"

    if [ -z "$backup_name" ]; then
        log_error "Nom du backup requis"
        echo ""
        echo "Usage: $0 --rollback BACKUP_NAME"
        echo "Utilisez '$0 --list' pour voir les backups disponibles"
        exit 1
    fi

    echo ""
    echo -e "${CYAN}=====================================================================${NC}"
    echo -e "${CYAN}🔄 RESTAURATION DU BACKUP: $backup_name${NC}"
    echo -e "${CYAN}=====================================================================${NC}"
    echo ""

    check_prerequisites
    test_ssh_connection

    log_step "Vérification du backup..."

    ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" "
        if [ ! -d '$BACKUP_DIR/$backup_name' ]; then
            echo 'Backup non trouvé: $backup_name'
            exit 1
        fi
        file_count=\$(find $BACKUP_DIR/$backup_name -type f | wc -l)
        echo 'Backup trouvé: '\$file_count' fichiers'
    "

    if [ $? -ne 0 ]; then
        log_error "Backup '$backup_name' non trouvé"
        log_info "Utilisez '$0 --list' pour voir les backups disponibles"
        exit 1
    fi

    log_success "Backup '$backup_name' trouvé"

    echo ""
    log_warning "⚠️  Cette action va remplacer le site actuel"
    read -p "Continuer ? (oui/non): " confirmation

    if [[ "$confirmation" != "oui" ]]; then
        log_info "Restauration annulée"
        exit 0
    fi

    # Backup de la version actuelle avant rollback
    local current_backup="pre-rollback-$(date +%Y%m%d-%H%M%S)"

    echo ""
    log_step "Restauration en cours..."

    ssh -i "$KEY_PATH" "$EC2_USER@$EC2_HOST" "
        # Backup version actuelle
        if [ -d '$EC2_PATH' ] && [ \"\$(ls -A $EC2_PATH 2>/dev/null)\" ]; then
            cp -r $EC2_PATH $BACKUP_DIR/$current_backup
        fi

        # Restaurer
        rm -rf $EC2_PATH/*
        cp -r $BACKUP_DIR/$backup_name/* $EC2_PATH/
        chmod -R 755 $EC2_PATH

        # Reload serveur web
        systemctl reload $WEB_SERVER 2>/dev/null || service $WEB_SERVER reload 2>/dev/null
    "

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 RESTAURATION TERMINÉE !${NC}"
        log_success "Version '$backup_name' restaurée"
        log_info "URL: $APP_URL"
    else
        log_error "Échec de la restauration"
        exit 1
    fi
}

# Aide
show_help() {
    echo ""
    echo -e "${CYAN}DÉPLOIEMENT $APP_NAME${NC}"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "  (aucun)              Déployer la version actuelle"
    echo "  -t, --test           Tester la connexion SSH"
    echo "  -c, --config         Afficher la configuration"
    echo "  -l, --list           Lister les backups"
    echo "  -r, --rollback NAME  Restaurer un backup"
    echo "  -h, --help           Afficher cette aide"
    echo ""
}

# Afficher la config
show_config() {
    echo ""
    echo -e "${CYAN}CONFIGURATION:${NC}"
    echo ""
    echo -e "Application:   ${YELLOW}$APP_NAME${NC}"
    echo -e "Serveur:       ${YELLOW}$EC2_USER@$EC2_HOST${NC}"
    echo -e "Clé SSH:       ${YELLOW}$KEY_PATH${NC}"
    echo -e "Destination:   ${YELLOW}$EC2_PATH${NC}"
    echo -e "Serveur web:   ${YELLOW}$WEB_SERVER${NC}"
    echo -e "Backups:       ${YELLOW}$BACKUP_DIR${NC}"
    echo -e "URL:           ${YELLOW}$APP_URL${NC}"
    echo ""
}

# Gestion des arguments
case "$1" in
    -h|--help)     show_help; exit 0 ;;
    -t|--test)     check_prerequisites; test_ssh_connection; log_success "Test réussi !"; exit 0 ;;
    -c|--config)   show_config; exit 0 ;;
    -l|--list)     check_prerequisites; test_ssh_connection; list_backups; exit 0 ;;
    -r|--rollback)
        if [ -z "$2" ]; then
            log_error "Nom du backup requis. Utilisez '$0 --list' pour les voir."
            exit 1
        fi
        rollback "$2"; exit 0 ;;
    "")            deploy ;;
    *)             log_error "Option inconnue: $1"; show_help; exit 1 ;;
esac
