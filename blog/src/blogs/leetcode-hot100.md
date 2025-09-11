---
title: "LeetCode Hot100 算法题解"
date: "2025-09-11"
category: "算法"
tags: ["javascript", "算法"]
summary: "用于记录 leetcode hot100 题解和一些思路"
author: "破酥"
readTime: "60分钟"
cover: "https://static.leetcode-cn.com/cn-legacy-assets/images/LeetCode_Sharing.png"
---

# LeetCode Hot100 算法题解

用于记录 leetcode hot100 题解和一些思路

# 两数之和

```typescript
function twoSum(nums: number[], target: number): number[] {
    const hashMap = new Map()
    const len = nums.length
    for (let i = 0; i < len; i++) {
        if (hashMap.has(target - nums[i])) {
            return [hashMap.get(target - nums[i]), i]
        } else {
            hashMap.set(nums[i], i)
        }
    }

    return []
};
```

# **字母异位词分组**

```typescript
function groupAnagrams(strs: string[]): string[][] {
    const result: string[][] = []
    const hashMap = new Map()

    const len = strs.length
    for (let i = 0; i < len; i++) {
        const temp = strs[i].split('').sort().join('')
        if (hashMap.has(temp)) {
            hashMap.get(temp).push(strs[i])
        } else {
            hashMap.set(temp, [strs[i]])
        }
    }
    
    for (const group of hashMap.values()) {
        result.push(group)
    }

    return result
}; 
```

# **最长连续序列**

```typescript
function longestConsecutive(nums: number[]): number {
    let result = 0
    const len = nums.length
    const set = new Set(nums)
    for (const x of set) {
		    // 如果有比 x 小的数满足连续条件，说明不是最长的跳过
        if (set.has(x - 1)) {
            continue
        }
        // 连续加一，找到最大的连续值
        let y = x + 1
        while(set.has(y)) {
            y++
        }
				// y - x 就是该连续序列的长度
        result = Math.max(result, y - x)
    }

    return result
};
```

# 移动零

这里要特别注意同时**保持非零元素的相对顺序**。

```typescript
/**
 Do not return anything, modify nums in-place instead.
 */
function moveZeroes(nums: number[]): void {
    const len = nums.length
    let l = 0
    let r = 0
    while (r < len) {
        if (nums[r] !== 0) {
            [nums[l], nums[r]] = [nums[r], nums[l]]
            l++
        }
        r++
    }
};
```

# **盛最多水的容器**

```typescript
function maxArea(height: number[]): number {
    const len = height.length
    let l = 0
    let r = len - 1
    let result = 0

    while (l < r) {
        const temp = Math.min(height[l], height[r]) * (r - l)
        result = Math.max(temp, result)
        if (height[l] > height[r]) r--
        else l++
    }

    return result

};
```

# 三数之和

```typescript
function threeSum(nums: number[]): number[][] {
    const len = nums.length
    const result: number[][] = []
    if (nums === null || len < 3) return result
    nums.sort((a, b) => a - b)

    for (let i = 0; i < len; i++) {
        if (nums[i] > 0) break
        if (i > 0 && nums[i] === nums[i-1]) continue

        let l = i + 1
        let r = len - 1
        while (l < r) {
            if (nums[i] + nums[l] + nums[r] > 0) r--
            else if (nums[i] + nums[l] + nums[r] < 0) l++
            else {
                result.push([nums[i], nums[l], nums[r]])
                // 跳过重复部分
                while(l < r && nums[l] === nums[l+1]) l++
                while(l < r && nums[r] === nums[r-1]) r--
                // 继续找满足条件的数
                l++
                r--
            }
            
        }
    }

    return result
};
```

# [hard] 接雨水

双指针 + 动态规划

```typescript
function trap(height: number[]): number {
    // 添加守护节点
    height = [0, ...height, 0]
    let result = 0
    const len = height.length
    // 第 i 个柱子左侧的最大高度
    const lMax = Array(len).fill(height[0])
    // 第 i 个柱子右侧的最大高度
    const rMax = Array(len).fill(height[len-1])

    for (let i = 1; i < len - 1; i++) {
        lMax[i] = Math.max(lMax[i - 1], height[i])
        rMax[len - i - 1] = Math.max(rMax[len - i], height[len - i - 1])
    }

    for (let i = 0; i < len; i++) {
        result += (Math.min(lMax[i], rMax[i]) - height[i])
    }

    return result
};
```

# **无重复字符的最长子串**

```typescript
function lengthOfLongestSubstring(s: string): number {
    const subStr = new Set<string>()
    const len = s.length

    let result = 0
    
    for (let i = 0; i < len; i++) {
        while (subStr.has(s[i])) {
            // 删除子串重复字符前的所有字符
            subStr.delete(s.charAt(i - subStr.size))
        } 
        subStr.add(s[i])
        result = Math.max(result, subStr.size)
        
    }

    return result
    
};
```

返回值是子串不是长度：

```javascript
function LongestSubstring(s: string): number {
    const subStr = new Set<string>()
    const len = s.length

    let result = ''
    let curMaxSize = 0
    
    for (let i = 0; i < len; i++) {
        while (subStr.has(s[i])) {
            // 删除子串重复字符前的所有字符
            subStr.delete(s.charAt(i - subStr.size))
        } 
        subStr.add(s[i])
        if (subStr.size > curMaxSize) {
	        result = [...subStr].join('')
	        curMaxSize = subStr.size
        }
        
    }

    return result
    
};
```

# **找到字符串中所有字母异位词**

**错误做法：每次都重新排序**是性能瓶颈，当字符串很长时，频繁的排序操作会导致超时

```typescript
function findAnagrams(s: string, p: string): number[] {
    const len = s.length
    const subLen = p.length
    const subStr = p.split('').sort().join('')

    const result = []

    // 创建窗口
    let l = 0
    let r = l + subLen

    while (r <= len) {
        const window = s.slice(l, r).split('').sort().join('')
        if (window === subStr) result.push(l)
        l++
        r++
    }
    
    return result
};
```

**滑动窗口 + 字符频率统计**，时间复杂度可以降到 **O(logn)**：

```typescript
function findAnagrams(s: string, p: string): number[] {
    
    let result: number[] = []
    let strMap = new Map()
    
    if (s.length < p.length) return result
    
    for (let i = 0; i < p.length; i++) {
        // 存储p中出现的字母以及出现次数
        strMap.set(p[i], (strMap.get(p[i]) || 0) + 1)
    }
    
    // 创建窗口
    let r = 0
    for ( ; r < p.length; r++) {
        if (strMap.has(s[r])) {
            strMap.set(s[r], strMap.get(s[r]) - 1)
        }
    }   

    // 移动窗口，找到异位词
    // 注意这里要是等号，到达尾部也要进行判断，确保最后一个窗口被检查
    for (let l = 0 ; r <= s.length ; r++, l++) {
        // 如果map中所有字符数量均被消费完毕，则说明找到异位词
        if ([...strMap.values()].every(v => v===0)) {
            result.push(l)
        }

        // 遍历已被消费的异位词，重新填充strMap
        if (strMap.has(s[l])) {
            strMap.set(s[l], strMap.get(s[l]) + 1)
        }

        // 如果遇到匹配的字符，则消费
        if (strMap.has(s[r])) {
            strMap.set(s[r], strMap.get(s[r]) - 1)
        }
    }

    return result
};
```

- 这里需要特别注意，子串大小不一定要严格等于p的长度，也可以小于。
    
    假设 s = "abab", p = "ab"：
    
    1. **创建窗口后**：r = 2，当前窗口是 s[0:1] = "ab"
    1. **第一次循环**：l = 0, r = 2，检查窗口 s[0:1] = "ab" ✓
    1. **第二次循环**：l = 1, r = 3，检查窗口 s[1:2] = "ba" ✓
    1. **第三次循环**：l = 2, r = 4，检查窗口 s[2:3] = "ab" ✓
    
    1. 1. **创建窗口后**：r = 2，当前窗口是 s[0:1] = "ab"
    2. 1. **第一次循环**：l = 0, r = 2，检查窗口 s[0:1] = "ab" ✓
    3. 1. **第二次循环**：l = 1, r = 3，检查窗口 s[1:2] = "ba" ✓
    4. 1. **第三次循环**：l = 2, r = 4，检查窗口 s[2:3] = "ab" ✓
    
    在第三次循环中，虽然 r = 4 已经等于 s.length，但是：
    
    - 窗口 s[2:3] = "ab" 仍然是有效的
    - 这是最后一个可能的窗口位置
    - 如果不检查这个窗口，就会遗漏最后一个可能的异位词
    
    **如果使用 r < s.length**：
    
    - 循环会在 r = 4 时停止
    - 最后一个窗口 s[2:3] 不会被检查
    - 结果会遗漏 index = 2 这个答案
    
    **使用 r <= s.length**：
    
    - 确保所有可能的窗口位置都被检查
    - 包括最后一个窗口
    
    这就是为什么需要用 <= 而不是 < 的原因 - 确保不遗漏任何可能的异位词位置

# **和为 K 的子数组**

**前缀和**

```tsx
function subarraySum(nums: number[], k: number): number {
    let result = 0

    // 当前和
    let sum = 0
    const map = new Map([[0,1]])
    const len = nums.length

    for (let i = 0; i < len; i++) {
        sum += nums[i]
        // 边求结果边统计前缀和
        // 如果当前和等于k则返回1，否则返回0
        result += map.get(sum - k) || 0
        // 更新前缀和
        map.set(sum, (map.get(sum) || 0) + 1)
    }

    return result
};
```

# **[hard] 滑动窗口最大值**

单调队列

```tsx
function maxSlidingWindow(nums: number[], k: number): number[] {
    const result: number[] = []

    // 创建单调队列，存储元素对应索引
    const queue = []
    const len = nums.length

    for (let i = 0; i < len; i++) {
        const value = nums[i]
        // 入队，value如果大于队尾元素，则将队尾元素删除
        // 直至直至队尾元素大于value，或者队列为空
        while (queue.length && nums[queue[queue.length - 1]] <= value) {
            queue.pop()
        }
        queue.push(i)

        // 出队，只有当前元素索引i与队首元素索引差值为窗口大小
        // 即是一个完整滑动窗口时，将队首元素索引出队
        if (i - queue[0] + 1 > k) {
            queue.shift()
        }

        // 保存滑动窗口最大值
        if (i >= k - 1) {
            result.push(nums[queue[0]])
        }

    }

    return result
};
```

# [hard] **最小覆盖子串**

利用数组下标作为 hashmap 的 key，再结合双指针维护一个动态窗口，右指针扩展窗口直到包含目标字符串的所有字符，然后左指针收缩窗口寻找最小覆盖子串。

```tsx
// 获取字母的 index
function getIndex(char: string) {
  return char >= 'A' && char <= 'Z' ? 
  char.charCodeAt(0) - 'A'.charCodeAt(0) + 26:
  char.charCodeAt(0) - 'a'.charCodeAt(0)
}

function minWindow(s: string, t: string): string {
    let result = ""

    // 用于统计 t 出现的字母
    const hash = Array(52).fill(0)
    // 用于统计 s 出现的字母
    const map = Array(52).fill(0)

    // t中出现的字符数
    let tCharNum = 0
    for (let i = 0; i < t.length; i++) {
        if (++hash[getIndex(t[i])] === 1) tCharNum++
    }

    const len = s.length
    for (let l = 0, r = 0; r < len; r++) {
        // 获取字母 index
        const right = getIndex(s[r]) 

        // 记录右侧字母出现次数
        map[right]++
        // 如果出现次数达到 t 中的出现次数，说明有一个字母已经满足条件，将字符数减1
        if (map[right] === hash[right]) tCharNum--

        while (l < r) {
            const left = getIndex(s[l])
            
            // 如果左指针指向的字母计数超过t中对应字母出现的次数，说明不是最短子串
            // 且该字母计数减一时不小于 0
            // 说明当前左指针可以移动作为新子串的开头
            if (map[left] > hash[left] && --map[left] >= 0) l++
            else break
        }

        if (tCharNum === 0 && (!result || result.length > r - l + 1)) {
            result = s.substring(l, r+1)    
        }

    }

    return result
};
```