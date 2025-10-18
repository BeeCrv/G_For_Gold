// Initialize the tree stack
const treeStack = new TreeStack();

// DOM elements for buttons
const addPersonBtn = document.getElementById('addPerson');
const removeLeaderBtn = document.getElementById('removeLeader');
const resetBtn = document.getElementById('reset');

// Event listeners
addPersonBtn.addEventListener('click', () => {
    const newNodes = [];
    
    // Add 3 people at once
    for (let i = 0; i < 3; i++) {
        const newNode = treeStack.addPerson();
        newNodes.push(newNode.id);
    }
    
    renderTree(treeStack);
    highlightNewNodes(newNodes);
    
    // Show success message
    showNotification('3 new members added to your golden network!', 'success');
});

removeLeaderBtn.addEventListener('click', () => {
    const result = treeStack.removeLeader();
    if (result) {
        renderTree(treeStack);
        highlightNodeChange(result.oldLeader.id, result.newLeader.id);
        
        // Show promotion message
        showNotification(`Member ${result.newLeader.id} promoted to leader!`, 'info');
    } else {
        showNotification('Cannot remove the only member!', 'error');
    }
});

resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset your golden network? This action cannot be undone.')) {
        treeStack.reset();
        renderTree(treeStack);
        showNotification('Network reset successfully!', 'info');
    }
});

// Disable remove leader button if only one node exists
function updateButtonStates() {
    removeLeaderBtn.disabled = treeStack.getTotalCount() <= 1;
}

// Modified renderTree to update button states
const originalRenderTree = enhancedRenderTree;
renderTree = function(treeStack) {
    originalRenderTree(treeStack);
    updateButtonStates();
};

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 
                     type === 'error' ? 'rgba(231, 76, 60, 0.9)' : 
                     'rgba(52, 152, 219, 0.9)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'info': return 'ℹ️';
        default: return '💡';
    }
}

// Add notification styles to head
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-icon {
        font-size: 1.2rem;
    }
    
    .notification-message {
        flex: 1;
    }
`;
document.head.appendChild(notificationStyles);

// Initial render
renderTree(treeStack);
updateButtonStates();

// Add some initial instructions
setTimeout(() => {
    showNotification('Welcome to G for Gold! Click "Add 3 Members" to start building your network.', 'info');
}, 1000);