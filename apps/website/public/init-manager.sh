#!/bin/bash

# Initialize Dokploy Manager Node
# This script sets up Syncthing configuration for decentralized sync across manager nodes

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

# Check if running as root
if [ "$(id -u)" != "0" ]; then
    echo "This script must be run as root" >&2
    exit 1
fi

# Generate a unique device ID for this node
generate_node_id() {
    hostname -f 2>/dev/null || hostname
}

# Generate a random Syncthing device ID
generate_syncthing_device_id() {
    # Generate a random 52-character base32 string (Syncthing device ID format)
    # Using openssl rand to generate random bytes and converting to base32
    openssl rand -base32 32 | tr -d '=' | cut -c1-52
}

# Setup Syncthing configuration for decentralized sync
setup_syncthing_config() {
    local node_id=$(generate_node_id)
    local syncthing_config_dir="/var/lib/dokploy-sync"
    local syncthing_config_path="$syncthing_config_dir/config.xml"
    
    mkdir -p "$syncthing_config_dir"
    
    # Only create config if it doesn't exist
    if [ ! -f "$syncthing_config_path" ]; then
        echo "Creating initial Syncthing config.xml as it does not exist."
        local device_id=$(generate_syncthing_device_id)
        echo "Generated device ID: $device_id"
        cat > "$syncthing_config_path" <<EOF
<configuration version="37">
    <folder id="dokploy-data" label="Dokploy Data" path="/var/syncthing/dokploy" type="sendreceive" rescanIntervalS="60" fsWatcherEnabled="true" fsWatcherDelayS="10">
        <device id="$device_id" introducedBy=""></device>
        <minDiskFree unit="%">1</minDiskFree>
        <versioning type="simple">
            <param key="keep" val="5"></param>
        </versioning>
        <copiers>0</copiers>
        <pullerMaxPendingKiB>0</pullerMaxPendingKiB>
        <hashers>0</hashers>
        <order>random</order>
        <ignorePerms>false</ignorePerms>
        <scanProgressIntervalS>0</scanProgressIntervalS>
        <pullerPauseS>0</pullerPauseS>
        <maxConflicts>10</maxConflicts>
        <disableSparseFiles>false</disableSparseFiles>
        <disableTempIndexes>false</disableTempIndexes>
        <paused>false</paused>
        <weakHashThresholdPct>25</weakHashThresholdPct>
        <markerName>.stfolder</markerName>
    </folder>
    <device id="$device_id" name="$node_id" compression="metadata" introducer="false" skipIntroductionRemovals="false" introducedBy="">
        <address>dynamic</address>
        <paused>false</paused>
        <autoAcceptFolders>false</autoAcceptFolders>
        <maxSendKbps>0</maxSendKbps>
        <maxRecvKbps>0</maxRecvKbps>
    </device>
    <gui enabled="true" tls="false" debugging="false">
        <address>0.0.0.0:8384</address>
        <user>admin</user>
        <password>$2a$10$BCRYPT_HASH</password>
        <apikey>GENERATE_API_KEY</apikey>
    </gui>
    <options>
        <listenAddress>default</listenAddress>
        <globalAnnounceServer>default</globalAnnounceServer>
        <globalAnnounceEnabled>true</globalAnnounceEnabled>
        <localAnnounceEnabled>true</localAnnounceEnabled>
        <localAnnouncePort>21027</localAnnouncePort>
        <localAnnounceMCAddr>[ff12::8384]:21027</localAnnounceMCAddr>
        <relaysEnabled>true</relaysEnabled>
        <relayReconnectIntervalM>10</relayReconnectIntervalM>
        <startBrowser>false</startBrowser>
        <natEnabled>true</natEnabled>
        <natLeaseMinutes>60</natLeaseMinutes>
        <natRenewalMinutes>30</natRenewalMinutes>
        <natTimeoutSeconds>10</natTimeoutSeconds>
        <urAccepted>-1</urAccepted>
        <autoUpgradeIntervalH>12</autoUpgradeIntervalH>
        <upgradeToPreReleases>false</upgradeToPreReleases>
        <keepTemporariesH>24</keepTemporariesH>
        <cacheIgnoredFiles>false</cacheIgnoredFiles>
        <progressUpdateIntervalS>5</progressUpdateIntervalS>
        <limitBandwidthInLan>false</limitBandwidthInLan>
        <minHomeDiskFree unit="%">1</minHomeDiskFree>
        <releasesURL>https://upgrades.syncthing.net/meta.json</releasesURL>
        <overwriteRemoteDeviceNamesOnConnect>false</overwriteRemoteDeviceNamesOnConnect>
        <tempIndexMinBlocks>10</tempIndexMinBlocks>
        <trafficClass>0</trafficClass>
        <setLowPriority>true</setLowPriority>
        <maxFolderConcurrency>0</maxFolderConcurrency>
        <crashReportingEnabled>false</crashReportingEnabled>
        <stunKeepaliveStartS>180</stunKeepaliveStartS>
        <stunKeepaliveMinS>20</stunKeepaliveMinS>
        <stunServer>default</stunServer>
        <databaseTuning>auto</databaseTuning>
        <maxConcurrentIncomingRequestKiB>0</maxConcurrentIncomingRequestKiB>
    </options>
</configuration>
EOF
        echo "${GREEN}✅ Syncthing configuration created with random device ID${NC}"
    else
        echo "${YELLOW}Syncthing config.xml already exists. Skipping creation.${NC}"
    fi
    
    # Create .stignore file to exclude syncthing's own directory
    mkdir -p /etc/dokploy
    cat > "/etc/dokploy/.stignore" <<'IGNORE_EOF'
# Ignore Syncthing's own marker
.stfolder
.stversions

# Ignore any temporary files
*.tmp
*.temp
.~*

# Ignore lock files
*.lock
IGNORE_EOF

    echo "Syncthing configuration created at $syncthing_config_dir"
}

# Create a helper script for adding peer nodes
create_sync_helper_script() {
    cat > /usr/local/bin/dokploy-sync <<'SCRIPT_EOF'
#!/bin/bash

# Dokploy Sync Manager
# Usage: dokploy-sync add <device-id>
#        dokploy-sync list
#        dokploy-sync status
#        dokploy-sync device-id

SYNCTHING_API="http://localhost:8384"
CONFIG_DIR="/var/lib/dokploy-sync"

get_api_key() {
    local config_file="$CONFIG_DIR/config.xml"
    if [ -f "$config_file" ]; then
        grep -oP '(?<=<apikey>)[^<]+' "$config_file" | head -1
    else
        # Fallback: try to get from running container
        docker exec $(docker ps -q -f name=dokploy-sync) cat /var/syncthing/config/config.xml 2>/dev/null | \
            grep -oP '(?<=<apikey>)[^<]+' | head -1
    fi
}

get_device_id() {
    # Wait for syncthing to be ready
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local device_id=$(docker exec $(docker ps -q -f name=dokploy-sync) syncthing device-id 2>/dev/null)
        if [ -n "$device_id" ]; then
            echo "$device_id"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo "Error: Could not retrieve device ID. Is Syncthing running?" >&2
    return 1
}

add_peer() {
    local peer_device_id="$1"
    local api_key=$(get_api_key)
    
    if [ -z "$peer_device_id" ]; then
        echo "Error: Device ID is required"
        echo "Usage: dokploy-sync add <device-id>"
        exit 1
    fi
    
    if [ -z "$api_key" ]; then
        echo "Error: Could not retrieve API key"
        exit 1
    fi
    
    echo "Adding peer device: $peer_device_id"
    
    # Add device via API
    local response=$(curl -s -X POST -H "X-API-Key: $api_key" \
         -H "Content-Type: application/json" \
         -d "{
            \"deviceID\": \"$peer_device_id\",
            \"name\": \"Manager-Node\",
            \"addresses\": [\"dynamic\"],
            \"compression\": \"metadata\",
            \"introducer\": true,
            \"autoAcceptFolders\": true
         }" \
         "$SYNCTHING_API/rest/config/devices")
    
    if echo "$response" | grep -q "error"; then
        echo "Error adding device: $response"
        exit 1
    fi
    
    echo "Device added to configuration"
    
    # Get current folder config
    local folder_config=$(curl -s -H "X-API-Key: $api_key" "$SYNCTHING_API/rest/config/folders/dokploy-data")
    
    # Add device to folder
    local updated_config=$(echo "$folder_config" | jq --arg deviceId "$peer_device_id" '.devices += [{"deviceID": $deviceId, "introducedBy": ""}]')
    
    curl -s -X PUT -H "X-API-Key: $api_key" \
         -H "Content-Type: application/json" \
         -d "$updated_config" \
         "$SYNCTHING_API/rest/config/folders/dokploy-data" > /dev/null
    
    # Restart Syncthing to apply changes
    curl -s -X POST -H "X-API-Key: $api_key" "$SYNCTHING_API/rest/system/restart" > /dev/null
    
    echo ""
    echo "✅ Peer added successfully!"
    echo "⏳ Syncthing is restarting to apply changes..."
    echo "🔄 The peer should automatically discover and sync in a few moments."
    echo ""
    echo "Check status with: dokploy-sync status"
}

list_peers() {
    local api_key=$(get_api_key)
    
    if [ -z "$api_key" ]; then
        echo "Error: Could not retrieve API key"
        exit 1
    fi
    
    echo "Connected Syncthing Peers:"
    echo "=========================="
    echo ""
    
    local connections=$(curl -s -H "X-API-Key: $api_key" "$SYNCTHING_API/rest/system/connections")
    
    if command -v jq &> /dev/null; then
        echo "$connections" | jq -r '.connections | to_entries[] | "Device: \(.key)\n  Connected: \(.value.connected)\n  Address: \(.value.address)\n  In/Out: \(.value.inBytesTotal)/\(.value.outBytesTotal) bytes\n"'
    else
        echo "$connections"
    fi
}

show_status() {
    local api_key=$(get_api_key)
    
    if [ -z "$api_key" ]; then
        echo "Error: Could not retrieve API key"
        exit 1
    fi
    
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              Dokploy Sync Status                           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    echo "📱 Device ID:"
    get_device_id
    echo ""
    
    echo "📊 System Status:"
    local system_status=$(curl -s -H "X-API-Key: $api_key" "$SYNCTHING_API/rest/system/status")
    if command -v jq &> /dev/null; then
        echo "$system_status" | jq '{myID, uptime, alloc: .alloc}'
    else
        echo "$system_status"
    fi
    echo ""
    
    echo "📁 Folder Status (dokploy-data):"
    local folder_status=$(curl -s -H "X-API-Key: $api_key" "$SYNCTHING_API/rest/db/status?folder=dokploy-data")
    if command -v jq &> /dev/null; then
        echo "$folder_status" | jq '{state, globalFiles, globalBytes, needFiles, needBytes}'
    else
        echo "$folder_status"
    fi
    echo ""
    
    echo "🔗 Connected Peers:"
    list_peers
}

show_ui_info() {
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║           Dokploy Sync Web Interface                       ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Access the Syncthing Web UI at:"
    echo "  http://YOUR_SERVER_IP:8384"
    echo ""
    echo "From the Web UI you can:"
    echo "  • View sync status in real-time"
    echo "  • Add/remove peers graphically"
    echo "  • Monitor bandwidth usage"
    echo "  • View conflict resolution"
    echo "  • See folder synchronization progress"
    echo ""
}

case "$1" in
    add)
        add_peer "$2"
        ;;
    list)
        list_peers
        ;;
    status)
        show_status
        ;;
    device-id)
        get_device_id
        ;;
    ui)
        show_ui_info
        ;;
    *)
        echo "╔════════════════════════════════════════════════════════════╗"
        echo "║          Dokploy Peer Sync Manager                         ║"
        echo "╚════════════════════════════════════════════════════════════╝"
        echo ""
        echo "Usage: dokploy-sync {add|list|status|device-id|ui}"
        echo ""
        echo "Commands:"
        echo "  device-id       - Show this node's device ID"
        echo "  add <device-id> - Add a peer manager node for sync"
        echo "  list            - List all connected peers"
        echo "  status          - Show detailed sync status"
        echo "  ui              - Show web interface information"
        echo ""
        echo "Quick Start:"
        echo "  1. On each manager node, run: dokploy-sync device-id"
        echo "  2. On node A, run: dokploy-sync add <node-B-device-id>"
        echo "  3. On node B, run: dokploy-sync add <node-A-device-id>"
        echo "  4. Check sync: dokploy-sync status"
        echo ""
        echo "The entire /etc/dokploy folder syncs automatically!"
        exit 1
        ;;
esac
SCRIPT_EOF

    chmod +x /usr/local/bin/dokploy-sync
    echo "✅ Helper script created at /usr/local/bin/dokploy-sync"
}

# Main execution
main() {
    printf "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}\n"
    printf "${CYAN}║      Dokploy Manager Node Initialization                   ║${NC}\n"
    printf "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"
    echo ""
    
    echo "Setting up Syncthing configuration..."
    setup_syncthing_config
    
    echo ""
    echo "Installing sync helper script..."
    create_sync_helper_script
    
    echo ""
    printf "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}\n"
    printf "${GREEN}║            Manager Node Initialized!                        ║${NC}\n"
    printf "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"
    echo ""
    printf "${YELLOW}Next steps:${NC}\n"
    echo ""
    printf "1️⃣  Get this node's Device ID:\n"
    printf "   ${GREEN}dokploy-sync device-id${NC}\n"
    echo ""
    printf "2️⃣  Share this Device ID with other manager nodes\n"
    echo ""
    printf "3️⃣  On other manager nodes, run:\n"
    printf "   ${GREEN}dokploy-sync add <device-id>${NC}\n"
    echo ""
    printf "4️⃣  Check sync status with:\n"
    printf "   ${GREEN}dokploy-sync status${NC}\n"
    echo ""
}

# Run main function
main

