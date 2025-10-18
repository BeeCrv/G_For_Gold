class TreeNode {
    constructor(id, level, parent = null) {
        this.id = id;
        this.level = level;
        this.parent = parent;
        this.children = [];
        this.isLeader = false;
        this.joinTime = new Date();
    }
}

class TreeStack {
    constructor() {
        this.root = new TreeNode(1, 0);
        this.root.isLeader = true;
        this.nodes = [this.root];
        this.nextId = 2;
        this.levels = [[this.root]];
        this.earningsRate = 100; // Base earning rate per member
    }
    
    addPerson() {
        // Find the node that has less than 3 children and is at the lowest level
        let targetNode = null;
        
        // search from deepest level to root so we fill lowest level first
        for (let i = this.levels.length - 1; i >= 0; i--) {
            const level = this.levels[i];
            for (let node of level) {
                if (node.children.length < 3) {
                    targetNode = node;
                    break;
                }
            }
            if (targetNode) break;
        }
        
        if (!targetNode) {
            // If all nodes have 3 children, create a new level
            const newLevel = [];
            const parentLevel = this.levels[this.levels.length - 1];
            for (let node of parentLevel) {
                for (let i = 0; i < 3; i++) {
                    const newNode = new TreeNode(this.nextId++, this.levels.length, node);
                    node.children.push(newNode);
                    this.nodes.push(newNode);
                    newLevel.push(newNode);
                }
            }
            this.levels.push(newLevel);
            return newLevel[0]; // Return first new node
        } else {
            // Add to existing node with less than 3 children
            const newNode = new TreeNode(this.nextId++, targetNode.level + 1, targetNode);
            targetNode.children.push(newNode);
            this.nodes.push(newNode);
            
            // Ensure the level array exists, then add node
            if (this.levels.length <= newNode.level) {
                this.levels.push([]);
            }
            this.levels[newNode.level].push(newNode);
            
            return newNode;
        }
    }
    
    removeLeader() {
        if (this.nodes.length <= 1) return null;
        
        const oldLeader = this.getLeader();
        if (!oldLeader) return null;
        
        // Choose replacement: prefer first child; otherwise BFS next node
        let newLeader = null;
        if (oldLeader.children.length > 0) {
            newLeader = oldLeader.children[0];
        } else {
            // Build full BFS list and pick the next node after the old leader
            const bfs = [];
            const queue = [this.root];
            while (queue.length > 0) {
                const current = queue.shift();
                bfs.push(current);
                if (current.children && current.children.length > 0) {
                    queue.push(...current.children);
                }
            }
            const idx = bfs.indexOf(oldLeader);
            newLeader = (idx >= 0 && idx + 1 < bfs.length) ? bfs[idx + 1] : null;
        }
        
        if (!newLeader) return null;
        
        const oldParent = oldLeader.parent || null;
        
        // Detach newLeader from its current parent (if any)
        if (newLeader.parent) {
            const prevParent = newLeader.parent;
            prevParent.children = prevParent.children.filter(c => c !== newLeader);
            newLeader.parent = null;
        }
        
        // Replace oldLeader with newLeader under oldParent (or make newLeader the root)
        if (oldParent) {
            // replace oldLeader with newLeader in oldParent.children
            oldParent.children = oldParent.children.map(c => (c === oldLeader ? newLeader : c));
            newLeader.parent = oldParent;
        } else {
            // oldLeader was root -> newLeader becomes root
            this.root = newLeader;
            newLeader.parent = null;
        }
        
        // Reparent oldLeader's other children (except newLeader) to newLeader
        const remainingChildren = oldLeader.children.filter(c => c !== newLeader);
        // clear oldLeader children to avoid accidental cycles
        oldLeader.children = [];
        for (const child of remainingChildren) {
            // avoid adding a child that's already the newLeader or already present
            if (child === newLeader) continue;
            child.parent = newLeader;
            newLeader.children.push(child);
        }
        
        // Mark leader flags
        oldLeader.isLeader = false;
        newLeader.isLeader = true;
        
        // Remove oldLeader from nodes list (will be rebuilt)
        this.nodes = this.nodes.filter(n => n !== oldLeader);
        
        // Rebuild levels and nodes array to keep consistency
        this.rebuildLevels();
        
        return { oldLeader, newLeader };
    }
    
    getTotalCount() {
        return this.nodes.length;
    }
    
    getLeader() {
        return this.nodes.find(node => node.isLeader);
    }
    
    getLevelCount() {
        return this.levels.length;
    }
    
    calculatePotentialEarnings() {
        const baseValue = this.getTotalCount() * this.earningsRate;
        const levelBonus = this.getLevelCount() * 50;
        return baseValue + levelBonus;
    }
    
    // Reset the tree to initial state
    reset() {
        this.root = new TreeNode(1, 0);
        this.root.isLeader = true;
        this.nodes = [this.root];
        this.nextId = 2;
        this.levels = [[this.root]];
    }
    
    // Helper: find node by id
    getNodeById(id) {
        return this.nodes.find(n => n.id === id) || null;
    }
    
    // Helper: remove arbitrary node (reparent children to its parent when possible)
    removeNode(id) {
        const node = this.getNodeById(id);
        if (!node) return false;
        if (node === this.root) {
            // Prefer using removeLeader for proper leader removal
            return !!this.removeLeader();
        }
        // detach from parent
        const parent = node.parent;
        if (parent) {
            parent.children = parent.children.filter(c => c !== node);
            // reparent node's children to the parent
            for (const child of node.children) {
                child.parent = parent;
                parent.children.push(child);
            }
        } else {
            // If no parent (shouldn't happen for non-root), just reparent children to null
            for (const child of node.children) {
                child.parent = null;
            }
        }
        // remove node from nodes list
        this.nodes = this.nodes.filter(n => n !== node);
        
        // Rebuild levels to keep level indices consistent
        this.rebuildLevels();
        return true;
    }
    
    // Rebuild levels and nodes list from current root (BFS)
    rebuildLevels() {
        if (!this.root) {
            this.levels = [];
            this.nodes = [];
            return;
        }
        const newLevels = [];
        const newNodes = [];
        const queue = [{ node: this.root, level: 0 }];
        while (queue.length > 0) {
            const { node, level } = queue.shift();
            node.level = level;
            if (!newLevels[level]) newLevels[level] = [];
            newLevels[level].push(node);
            newNodes.push(node);
            for (const child of node.children) {
                queue.push({ node: child, level: level + 1 });
            }
        }
        this.levels = newLevels;
        this.nodes = newNodes;
    }
}

// export for unit tests
module.exports = { TreeStack, TreeNode };