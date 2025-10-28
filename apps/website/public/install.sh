#!/bin/bash

# Function to detect if running in Proxmox LXC container
is_proxmox_lxc() {
    # Check for LXC in environment
    if [ -n "$container" ] && [ "$container" = "lxc" ]; then
        return 0  # LXC container
    fi
    
    # Check for LXC in /proc/1/environ
    if grep -q "container=lxc" /proc/1/environ 2>/dev/null; then
        return 0  # LXC container
    fi
    
    return 1  # Not LXC
}

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
    else
        echo "Syncthing config.xml already exists. Skipping creation."
    fi
    
    # Create .stignore file to exclude syncthing's own directory
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
        local device_id=$(docker exec $(docker ps -q -f name=dokploy-sync) syncthing -home /var/syncthing/config -device-id 2>/dev/null)
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

install_dokploy() {
    if [ "$(id -u)" != "0" ]; then
        echo "This script must be run as root" >&2
        exit 1
    fi

    # check if is Mac OS
    if [ "$(uname)" = "Darwin" ]; then
        echo "This script must be run on Linux" >&2
        exit 1
    fi

    # check if is running inside a container
    if [ -f /.dockerenv ]; then
        echo "This script must be run on Linux" >&2
        exit 1
    fi

    # check if something is running on port 80
    if ss -tulnp | grep ':80 ' >/dev/null; then
        echo "Error: something is already running on port 80" >&2
        exit 1
    fi

    # check if something is running on port 443
    if ss -tulnp | grep ':443 ' >/dev/null; then
        echo "Error: something is already running on port 443" >&2
        exit 1
    fi

    command_exists() {
      command -v "$@" > /dev/null 2>&1
    }

    if command_exists docker; then
      echo "Docker already installed"
    else
      curl -sSL https://get.docker.com | sh
    fi

    # Install jq for JSON parsing (helpful but not required)
    if ! command_exists jq; then
        echo "Installing jq for better CLI output..."
        if command_exists apt-get; then
            apt-get update && apt-get install -y jq
        elif command_exists yum; then
            yum install -y jq
        elif command_exists apk; then
            apk add jq
        fi
    fi

    # Check if running in Proxmox LXC container and set endpoint mode
    endpoint_mode=""
    publish_mode="ingress"
    if is_proxmox_lxc; then
        echo "⚠️ WARNING: Detected Proxmox LXC container environment!"
        echo "Configuring Docker Swarm for LXC compatibility..."
        echo "Using dnsrr endpoint mode and host publish mode for services."
        echo ""
        endpoint_mode="--endpoint-mode dnsrr"
        publish_mode="host"
        echo "Waiting for 3 seconds before continuing..."
        sleep 3
    fi


    docker swarm leave --force 2>/dev/null

    get_ip() {
        local ip=""
        
        # Try IPv4 first
        # First attempt: ifconfig.io
        ip=$(curl -4s --connect-timeout 5 https://ifconfig.io 2>/dev/null)
        
        # Second attempt: icanhazip.com
        if [ -z "$ip" ]; then
            ip=$(curl -4s --connect-timeout 5 https://icanhazip.com 2>/dev/null)
        fi
        
        # Third attempt: ipecho.net
        if [ -z "$ip" ]; then
            ip=$(curl -4s --connect-timeout 5 https://ipecho.net/plain 2>/dev/null)
        fi

        # If no IPv4, try IPv6
        if [ -z "$ip" ]; then
            # Try IPv6 with ifconfig.io
            ip=$(curl -6s --connect-timeout 5 https://ifconfig.io 2>/dev/null)
            
            # Try IPv6 with icanhazip.com
            if [ -z "$ip" ]; then
                ip=$(curl -6s --connect-timeout 5 https://icanhazip.com 2>/dev/null)
            fi
            
            # Try IPv6 with ipecho.net
            if [ -z "$ip" ]; then
                ip=$(curl -6s --connect-timeout 5 https://ipecho.net/plain 2>/dev/null)
            fi
        fi

        if [ -z "$ip" ]; then
            echo "Error: Could not determine server IP address automatically (neither IPv4 nor IPv6)." >&2
            echo "Please set the ADVERTISE_ADDR environment variable manually." >&2
            echo "Example: export ADVERTISE_ADDR=<your-server-ip>" >&2
            exit 1
        fi

        echo "$ip"
    }

    get_private_ip() {
        ip addr show | grep -E "inet (192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)" | head -n1 | awk '{print $2}' | cut -d/ -f1
    }

    advertise_addr="${ADVERTISE_ADDR:-$(get_private_ip)}"

    if [ -z "$advertise_addr" ]; then
        echo "ERROR: We couldn't find a private IP address."
        echo "Please set the ADVERTISE_ADDR environment variable manually."
        echo "Example: export ADVERTISE_ADDR=192.168.1.100"
        exit 1
    fi
    echo "Using advertise address: $advertise_addr"

    docker swarm init --advertise-addr $advertise_addr
    
     if [ $? -ne 0 ]; then
        echo "Error: Failed to initialize Docker Swarm" >&2
        exit 1
    fi

    echo "Swarm initialized"

    docker network rm -f dokploy-network 2>/dev/null
    docker network create --driver overlay --attachable dokploy-network

    echo "Network created"

    # Create main dokploy directory
    mkdir -p /etc/dokploy
    chmod 755 /etc/dokploy

    # Setup Syncthing configuration
    setup_syncthing_config
    create_sync_helper_script

    echo "Creating PostgreSQL service..."
    docker service create \
    --name dokploy-postgres \
    --constraint 'node.role==manager' \
    --network dokploy-network \
    --env POSTGRES_USER=dokploy \
    --env POSTGRES_DB=dokploy \
    --env POSTGRES_PASSWORD=amukds4wi9001583845717ad2 \
    --publish published=5432,target=5432,mode=$publish_mode \
    $endpoint_mode \
    --mount type=volume,source=dokploy-postgres-database,target=/var/lib/postgresql/data \
    postgres:16

    echo "Creating Redis service..."
    docker service create \
    --name dokploy-redis \
    --constraint 'node.role==manager' \
    --network dokploy-network \
    --publish published=6379,target=6379,mode=$publish_mode \
    $endpoint_mode \
    --mount type=volume,source=redis-data-volume,target=/data \
    redis:7

    echo "Creating Dokploy service..."
    # Installation
    docker service create \
      --name dokploy \
      --replicas 1 \
      --network dokploy-network \
      --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
      --mount type=bind,source=/etc/dokploy,target=/etc/dokploy \
      --mount type=volume,source=dokploy-docker-config,target=/root/.docker \
      --publish published=3000,target=3000,mode=host \
      --update-parallelism 1 \
      --update-order stop-first \
      --constraint 'node.role == manager' \
      $endpoint_mode \
      -e ADVERTISE_ADDR=$advertise_addr \
      dokploy/dokploy:latest

    echo "Waiting for Dokploy to start..."
    sleep 5

    # 🔹 Syncthing service for decentralized P2P sync of entire /etc/dokploy
    echo "Creating Syncthing sync service..."
    docker service create \
        --name dokploy-sync \
        --mode global \
        --constraint 'node.role==manager' \
        --user root \
        --network dokploy-network \
        --mount type=bind,source=/etc/dokploy,target=/var/syncthing/dokploy \
        --mount type=bind,source=/var/lib/dokploy-sync,target=/var/syncthing/config \
        --publish published=8384,target=8384,mode=host \
        --publish published=22000,target=22000,mode=host \
        --publish published=22000,target=22000,protocol=udp,mode=host \
        --publish published=21027,target=21027,protocol=udp,mode=host \
        $endpoint_mode \
        syncthing/syncthing:latest

    echo "Waiting for Syncthing to initialize..."
    sleep 10

    echo "Creating Traefik service..."
    docker service create \
        --name dokploy-traefik \
        --constraint 'node.role==manager' \
        --network dokploy-network \
        --mount type=bind,source=/etc/dokploy/traefik/traefik.yml,target=/etc/traefik/traefik.yml \
        --mount type=bind,source=/etc/dokploy/traefik/dynamic,target=/etc/dokploy/traefik/dynamic \
        --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
        --publish mode=host,published=443,target=443 \
        --publish mode=host,published=80,target=80 \
        --publish mode=host,published=443,target=443,protocol=udp \
        $endpoint_mode \
        traefik:v3.1.2

    GREEN="\033[0;32m"
    YELLOW="\033[1;33m"
    BLUE="\033[0;34m"
    CYAN="\033[0;36m"
    MAGENTA="\033[0;35m"
    NC="\033[0m" # No Color

    format_ip_for_url() {
        local ip="$1"
        if echo "$ip" | grep -q ':'; then
            # IPv6
            echo "[${ip}]"
        else
            # IPv4
            echo "${ip}"
        fi
    }

    public_ip="${ADVERTISE_ADDR:-$(get_ip)}"
    formatted_addr=$(format_ip_for_url "$public_ip")
    
    echo ""
    printf "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}\n"
    printf "${GREEN}║         🎉 Dokploy Successfully Installed! 🎉              ║${NC}\n"
    printf "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"
    echo ""
    printf "${BLUE}⏳ Wait 15-30 seconds for all services to start${NC}\n"
    printf "${YELLOW}🌐 Dokploy UI: http://${formatted_addr}:3000${NC}\n"
    echo ""
    printf "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}\n"
    printf "${CYAN}║         🔄 Decentralized Sync Configuration 🔄             ║${NC}\n"
    printf "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"
    echo ""
    printf "${MAGENTA}📂 Entire /etc/dokploy folder will be synced across managers${NC}\n"
    printf "${MAGENTA}🌐 Syncthing Web UI: http://${formatted_addr}:8384${NC}\n"
    echo ""
    printf "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    printf "${CYAN}To set up multi-node synchronization:${NC}\n"
    printf "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo ""
    printf "1️⃣  Get this node's Device ID:\n"
    printf "   ${GREEN}dokploy-sync device-id${NC}\n"
    echo ""
    printf "2️⃣  On another manager node, add this node:\n"
    printf "   ${GREEN}dokploy-sync add <device-id-from-step-1>${NC}\n"
    echo ""
    printf "3️⃣  On this node, add the other manager:\n"
    printf "   ${GREEN}dokploy-sync add <other-node-device-id>${NC}\n"
    echo ""
    printf "4️⃣  Check synchronization status:\n"
    printf "   ${GREEN}dokploy-sync status${NC}\n"
    echo ""
    printf "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    printf "${CYAN}Additional Commands:${NC}\n"
    printf "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo ""
    printf "📋 List connected peers:  ${GREEN}dokploy-sync list${NC}\n"
    printf "🖥️  Web UI info:          ${GREEN}dokploy-sync ui${NC}\n"
    echo ""
    printf "${GREEN}✨ Everything in /etc/dokploy syncs automatically between nodes! ✨${NC}\n"
    echo ""
}

update_dokploy() {
    echo "Updating Dokploy..."
    
    # Pull the latest image
    docker pull dokploy/dokploy:latest

    # Update the service
    docker service update --image dokploy/dokploy:latest dokploy

    echo "Dokploy has been updated to the latest version."
}

# Main script execution
if [ "$1" = "update" ]; then
    update_dokploy
else
    install_dokploy
fi