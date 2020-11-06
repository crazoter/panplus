/**
 * @file MinHeap, JS implementation of min heap
 */
let MinHeap = (() => {
    /**
     * MinHeap, JS implementation of min heap
     */
    class MinHeap {
        constructor(arr) {
            if (arr == null) {
                this.harr = [];
            } else {
                this.harr = arr;
                this.buildHeap();
            }
        }

        buildHeap() { 
            // Index of last non-leaf node 
            let startIdx = ((this.harr.length / 2) | 0) - 1; 
            // Perform reverse level order traversal 
            // from last non-leaf node and heapify 
            // each node 
            for (let i = startIdx; i >= 0; i--) {
                this.heapify(i); 
            } 
        } 

        // Inserts a new key 'k' 
        insertKey(k) { 
            // First insert the new key at the end 
            this.harr.length++; 
            let i = this.harr.length - 1; 
            this.harr[i] = k; 
            // Fix the min heap property if it is violated 
            while (i != 0 && this.harr[this.parent(i)] > this.harr[i]) { 
                this.swapByIndex(i, this.parent(i)); 
                i = this.parent(i); 
            } 
        } 
        
        getMin() { return this.harr[0]; }
        size() { return this.harr.length; }
        toArray() { return this.harr; }
        parent(i) { return (i - 1) / 2 | 0; }
        // to get index of left child of node at index i 
        left(i) { return (2 * i + 1); } 
        // to get index of right child of node at index i 
        right(i) { return (2 * i + 2); } 

        // Method to remove minimum element (or root) from min heap 
        extractMin() { 
            if (this.harr.length <= 0) 
                return Infinity; 
            if (this.harr.length == 1) { 
                let root = this.harr[0]; 
                this.harr.length--;
                return root; 
            } 
        
            // Store the minimum value, and remove it from heap 
            let root = this.harr[0]; 
            this.harr[0] = this.harr[this.harr.length - 1]; 
            this.harr.length--;
            this.heapify(0); 
        
            return root; 
        } 
        
        // A recursive method to heapify a subtree with the root at given index 
        // This method assumes that the subtrees are already heapified 
        heapify(i) { 
            let l = this.left(i); 
            let r = this.right(i); 
            let smallest = i; 
            if (l < this.harr.length && this.harr[l] < this.harr[i]) 
                smallest = l; 
            if (r < this.harr.length && this.harr[r] < this.harr[smallest]) 
                smallest = r; 
            if (smallest != i) { 
                this.swapByIndex(i, smallest); 
                this.heapify(smallest); 
            } 
        } 
        
        // A utility function to swapByIndex two elements 
        swapByIndex(i1, i2) { 
            this.harr[i1] ^= this.harr[i2];
            this.harr[i2] ^= this.harr[i1];
            this.harr[i1] ^= this.harr[i2];
        } 
    }
    return MinHeap;
})();

/**
 * Test Code
 */
/*
x = new MinHeap();
x.insertKey(1);
x.insertKey(10);
x.insertKey(2);
x.insertKey(42184);
x.insertKey(28);
x.insertKey(421);
x.insertKey(421);
x.insertKey(3);
x.getMin();
x.extractMin();
x.extractMin();
x.extractMin();
x.extractMin();
y = new MinHeap([10,9,6,8,5,2,6,1,2]);
*/