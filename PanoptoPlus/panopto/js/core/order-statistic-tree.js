//Port from C++ implementation
//https://www.geeksforgeeks.org/order-statistic-tree-using-fenwick-tree-bit/
//https://stackoverflow.com/questions/21995930/dynamic-i-e-variable-size-fenwick-tree
OrderStatisticTree = (() => {
    class OrderStatisticTree {
        constructor() {
            this.BIT = [0];
            this.count = 0;
        }

        /* Updates element at index 'i' of BIT. */
        update(i, val) { 
            while (i > 0) { 
                if (this.BIT[i] === undefined) 
                    this.BIT[i] = val;
                else 
                    this.BIT[i] += val; 
                i -= i & -i;
            } 
        } 

        /* Returns cumulative sum of all elements of 
        fenwick tree/BIT from start upto and 
        including element at index 'i'. */
        sum(i) { 
            if (i === 0) return 0;
            let ans = 0; 
            while (i <= this.BIT.length) { 
                ans += this.BIT[i] === undefined ? 0 : this.BIT[i];
                i += i & -i;
            } 
            return ans; 
        } 

        // Returns lower bound for k in BIT. 
        findKthLargest(k) {
            // Do binary search in BIT[] for given 
            // value k. 
            let l = 0; 
            let h = this.BIT.length; 
            while (l < h) {
                //https://stackoverflow.com/questions/9391718/javascript-integer-division-or-is-math-floorx-equivalent-to-x-0-for-x-0
                let mid = ((l + h) / 2) | 0; 
                //console.log(l, h, k, mid, this.sum(mid))
                if (k <= this.findRankFromLargest(mid)) {
                    l = mid + 1;
                    //h = mid; 
                } else {
                    //l = mid + 1; 
                    h = mid;
                }
            } 
            return l - 1; 
        } 

        findKthSmallest(k) {
            return this.findKthLargest(this.count - k + 1);
        }

        /**
         * Get Kth percentile 
         * @param {Number} k Percent from 0 - 100
         */
        findKthPercentile(k) {
            return this.findKthSmallest(Math.round(this.count / 100 * k));
        }

        // Insert x into BIT. We basically increment 
        // rank of all elements greater than x. 
        insertElement(x) { 
            x |= 0;
            if (x > 0) {
                this.update(x, 1);
                this.count++;
            } else {
                console.error("OrderStatisticTree only supports non negative integer values");
            }
        } 
        
        // Delete x from BIT. We basically decreases 
        // rank of all elements greater than x. 
        deleteElement(x) { 
            x |= 0;
            if (x > 0) {
                this.update(x, -1); 
                this.count--;
            } else {
                console.error("OrderStatisticTree only supports non negative integer values");
            }
        } 
        
        // Returns rank of element. We basically 
        // return sum of elements from start to 
        // index x. 
        findRankFromLargest(x) { return this.sum(x); } 
    }
    return OrderStatisticTree;
})();

//test cases
let x = new OrderStatisticTree();
for (let i = 1; i < 100; i++)
    x.insertElement(i*7);

    /*
for (let i = 10; i < 100; i++)
    x.insertElement(Math.ceil(Math.log10(i)));
    */