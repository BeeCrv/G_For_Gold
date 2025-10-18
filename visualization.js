// DOM elements
const treeContainer = document.getElementById('treeContainer');
const totalCountEl = document.getElementById('totalCount');
const leaderIdEl = document.getElementById('leaderId');
const levelCountEl = document.getElementById('levelCount');
const potentialEarningsEl = document.getElementById('potentialEarnings');

function renderTree(treeStack) {
    treeContainer.innerHTML = '';
    
    for (let i = 0; i < treeStack.levels.length; i++) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'level';
        levelDiv.id = `level-${i}`;
        
        treeStack.levels[i].forEach(node => {
            const nodeWrapper = document.createElement('div');
            nodeWrapper.className = 'node';
            nodeWrapper.setAttribute('data-node-id', node.id);
            
            if (node.isLeader) {
                nodeWrapper.classList.add('leader');
            }
            
            const nodeCircle = document.createElement('div');
            nodeCircle.className = 'node-circle';
            nodeCircle.textContent = node.id;
            
            const nodeLabel = document.createElement('div');
            nodeLabel.className = 'node-label';
            nodeLabel.textContent = node.isLeader ? 'Leader' : `Level ${node.level}`;
            
            nodeWrapper.appendChild(nodeCircle);
            nodeWrapper.appendChild(nodeLabel);
            levelDiv.appendChild(nodeWrapper);
        });
        
        treeContainer.appendChild(levelDiv);
    }
    
    // Create connectors between nodes
    createConnectors(treeStack);
    
    updateStats(treeStack);
}

function updateStats(treeStack) {
    totalCountEl.textContent = treeStack.getTotalCount();
    const leader = treeStack.getLeader();
    leaderIdEl.textContent = leader ? leader.id : 'None';
    levelCountEl.textContent = treeStack.getLevelCount();
    
    // Format earnings as currency
    const earnings = treeStack.calculatePotentialEarnings();
    potentialEarningsEl.textContent = formatCurrency(earnings);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}

function highlightNodeChange(oldLeaderId, newLeaderId) {
    const oldLeaderEl = document.querySelector(`[data-node-id="${oldLeaderId}"]`);
    const newLeaderEl = document.querySelector(`[data-node-id="${newLeaderId}"]`);
    
    if (oldLeaderEl) {
        oldLeaderEl.classList.add('removed');
        setTimeout(() => {
            oldLeaderEl.classList.remove('removed');
        }, 1000);
    }
    
    if (newLeaderEl) {
        newLeaderEl.classList.add('active');
        setTimeout(() => {
            newLeaderEl.classList.remove('active');
        }, 1000);
    }
}

function highlightNewNodes(newNodes) {
    newNodes.forEach(nodeId => {
        const newNodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (newNodeEl) {
            newNodeEl.classList.add('new');
            setTimeout(() => {
                newNodeEl.classList.remove('new');
            }, 1000);
        }
    });
}

function createConnectors(treeStack) {
    // Remove existing connectors
    const existingConnectors = document.querySelectorAll('.connector');
    existingConnectors.forEach(connector => connector.remove());
    
    // Create connectors between parent and child nodes
    treeStack.nodes.forEach(node => {
        if (node.children.length > 0) {
            const parentEl = document.querySelector(`[data-node-id="${node.id}"] .node-circle`);
            if (parentEl) {
                node.children.forEach(child => {
                    const childEl = document.querySelector(`[data-node-id="${child.id}"] .node-circle`);
                    if (childEl) {
                        createConnectorLine(parentEl, childEl);
                    }
                });
            }
        }
    });
}

function createConnectorLine(parentEl, childEl) {
    const connector = document.createElement('div');
    connector.className = 'connector';
    
    const parentRect = parentEl.getBoundingClientRect();
    const childRect = childEl.getBoundingClientRect();
    const treeContainerRect = treeContainer.getBoundingClientRect();
    
    const parentX = parentRect.left + parentRect.width / 2 - treeContainerRect.left;
    const parentY = parentRect.top + parentRect.height - treeContainerRect.top;
    const childX = childRect.left + childRect.width / 2 - treeContainerRect.left;
    const childY = childRect.top - treeContainerRect.top;
    
    const length = Math.sqrt(Math.pow(childX - parentX, 2) + Math.pow(childY - parentY, 2));
    const angle = Math.atan2(childY - parentY, childX - parentX) * 180 / Math.PI;
    
    connector.style.cssText = `
        position: absolute;
        left: ${parentX}px;
        top: ${parentY}px;
        width: ${length}px;
        height: 2px;
        background: linear-gradient(90deg, rgba(255,215,0,0.6), rgba(255,215,0,0.3));
        transform: rotate(${angle}deg);
        transform-origin: 0 0;
        z-index: 1;
    `;
    
    treeContainer.appendChild(connector);
}

// Enhanced node interaction
function addNodeInteractions(treeStack) {
    const nodes = document.querySelectorAll('.node');
    
    nodes.forEach(node => {
        // Add hover effects
        node.addEventListener('mouseenter', function() {
            const nodeId = this.getAttribute('data-node-id');
            const treeNode = treeStack.nodes.find(n => n.id == nodeId);
            if (treeNode) {
                showNodeInfo(treeNode, this);
            }
        });
        
        node.addEventListener('mouseleave', function() {
            hideNodeInfo();
        });
        
        // Add click effect
        node.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

function showNodeInfo(treeNode, element) {
    // Remove existing info box
    hideNodeInfo();
    
    const infoBox = document.createElement('div');
    infoBox.className = 'node-info';
    infoBox.innerHTML = `
        <div class="info-content">
            <h4>Member #${treeNode.id}</h4>
            <p><strong>Level:</strong> ${treeNode.level}</p>
            <p><strong>Children:</strong> ${treeNode.children.length}/3</p>
            <p><strong>Status:</strong> ${treeNode.isLeader ? '👑 Leader' : 'Member'}</p>
            ${treeNode.parent ? `<p><strong>Parent:</strong> #${treeNode.parent.id}</p>` : ''}
        </div>
    `;
    
    infoBox.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid var(--gold-primary);
        z-index: 100;
        max-width: 200px;
        backdrop-filter: blur(10px);
    `;
    
    const rect = element.getBoundingClientRect();
    const treeRect = treeContainer.getBoundingClientRect();
    
    infoBox.style.left = `${rect.left - treeRect.left}px`;
    infoBox.style.top = `${rect.top - treeRect.top - 120}px`;
    
    treeContainer.appendChild(infoBox);
}

function hideNodeInfo() {
    const existingInfo = document.querySelector('.node-info');
    if (existingInfo) {
        existingInfo.remove();
    }
}

// Enhanced rendering with interactions
const enhancedRenderTree = function(treeStack) {
    renderTree(treeStack);
    setTimeout(() => {
        addNodeInteractions(treeStack);
    }, 100);
};

// Export functions for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderTree: enhancedRenderTree,
        updateStats,
        formatCurrency,
        highlightNodeChange,
        highlightNewNodes,
        createConnectors,
        addNodeInteractions,
        showNodeInfo,
        hideNodeInfo
    };
}