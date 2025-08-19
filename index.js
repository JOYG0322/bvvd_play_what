const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>战争雷霆模式抽取器</title>
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --light-color: #ecf0f1;
            --dark-color: #34495e;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        header {
            text-align: center;
            margin-bottom: 30px;
            color: var(--primary-color);
        }
        
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .mode-selection {
            margin-bottom: 25px;
        }
        
        .mode-item {
            margin: 10px 0;
            display: flex;
            align-items: center;
        }
        
        .mode-item input {
            margin-right: 10px;
        }
        
        .actions {
            display: flex;
            justify-content: center;
            margin: 25px 0;
        }
        
        button {
            background-color: var(--secondary-color);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        
        button:hover {
            background-color: var(--dark-color);
        }
        
        .result {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background-color: var(--light-color);
            border-radius: 4px;
            font-size: 24px;
            font-weight: bold;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            text-align: center;
        }
        
        .stat-item {
            background-color: var(--light-color);
            padding: 15px;
            border-radius: 4px;
            flex: 1;
            margin: 0 10px;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: var(--secondary-color);
        }
        
        .history {
            margin-top: 30px;
        }
        
        .history h3 {
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 10px;
        }
        
        .history-list {
            max-height: 200px;
            overflow-y: auto;
        }
        
        .history-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
        }
        
        .history-item:nth-child(odd) {
            background-color: #f9f9f9;
        }
        
        footer {
            text-align: center;
            margin-top: 30px;
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .loading {
            color: #7f8c8d;
            font-style: italic;
        }
    </style>
</head>
<body>
    <header>
        <h1>战争雷霆模式抽取器</h1>
        <p>选择您想游玩的模式，然后点击抽取按钮</p>
    </header>
    
    <div class="container">
        <div class="mode-selection">
            <h2>选择游戏模式</h2>
            <div class="mode-item">
                <input type="checkbox" id="ground-ab" checked>
                <label for="ground-ab">陆战街机</label>
            </div>
            <div class="mode-item">
                <input type="checkbox" id="ground-rb" checked>
                <label for="ground-rb">陆战历史</label>
            </div>
            <div class="mode-item">
                <input type="checkbox" id="ground-sb">
                <label for="ground-sb">陆战全真</label>
            </div>
            <div class="mode-item">
                <input type="checkbox" id="air-ab" checked>
                <label for="air-ab">空战街机</label>
            </div>
            <div class="mode-item">
                <input type="checkbox" id="air-rb" checked>
                <label for="air-rb">空战历史</label>
            </div>
        </div>
        
        <div class="actions">
            <button id="draw-button">抽取模式</button>
        </div>
        
        <div class="result" id="result">
            等待抽取...
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-label">今日抽取次数</div>
                <div class="stat-number" id="today-count">0</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">总抽取次数</div>
                <div class="stat-number" id="total-count">0</div>
            </div>
        </div>
        
        <div class="history">
            <h3>抽取历史</h3>
            <div class="history-list" id="history-list">
                <div class="loading">加载中...</div>
            </div>
        </div>
    </div>
    
    <footer>
        <p>数据存储在Cloudflare KV中 | 更新时间: <span id="update-time"></span></p>
    </footer>

    <script>
        // 定义游戏模式
        const gameModes = {
            'ground-ab': '陆战街机',
            'ground-rb': '陆战历史',
            'ground-sb': '陆战全真',
            'air-ab': '空战街机',
            'air-rb': '空战历史'
        };
        
        // DOM元素
        const drawButton = document.getElementById('draw-button');
        const resultElement = document.getElementById('result');
        const todayCountElement = document.getElementById('today-count');
        const totalCountElement = document.getElementById('total-count');
        const historyListElement = document.getElementById('history-list');
        const updateTimeElement = document.getElementById('update-time');
        
        // 从API获取数据
        async function fetchData() {
            try {
                const response = await fetch('/api/stats');
                if (!response.ok) throw new Error('获取数据失败');
                const data = await response.json();
                
                updateUI(data);
            } catch (error) {
                console.error('获取数据失败:', error);
                resultElement.textContent = '数据加载失败，请刷新页面重试';
            }
        }
        
        // 执行抽取
        async function drawMode() {
            // 获取选中的模式
            const selectedModes = [];
            for (const modeId in gameModes) {
                const checkbox = document.getElementById(modeId);
                if (checkbox.checked) {
                    selectedModes.push(modeId);
                }
            }
            
            if (selectedModes.length === 0) {
                resultElement.textContent = '请至少选择一个模式';
                return;
            }
            
            try {
                const response = await fetch('/api/draw', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ modes: selectedModes })
                });
                
                if (!response.ok) throw new Error('抽取失败');
                
                const data = await response.json();
                updateUI(data);
            } catch (error) {
                console.error('抽取失败:', error);
                resultElement.textContent = '抽取失败，请重试';
            }
        }
        
        // 更新UI显示
        function updateUI(data) {
            resultElement.textContent = data.lastResult ? gameModes[data.lastResult] : '等待抽取...';
            todayCountElement.textContent = data.todayDraws || 0;
            totalCountElement.textContent = data.totalDraws || 0;
            
            // 更新历史记录
            if (data.history && data.history.length > 0) {
                historyListElement.innerHTML = '';
                data.history.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    
                    const modeSpan = document.createElement('span');
                    modeSpan.textContent = gameModes[item.mode];
                    
                    const timeSpan = document.createElement('span');
                    timeSpan.textContent = new Date(item.timestamp).toLocaleTimeString();
                    
                    historyItem.appendChild(modeSpan);
                    historyItem.appendChild(timeSpan);
                    historyListElement.appendChild(historyItem);
                });
            } else {
                historyListElement.innerHTML = '<div class="loading">暂无历史记录</div>';
            }
            
            // 更新页面底部时间
            updateTimeElement.textContent = new Date().toLocaleTimeString();
        }
        
        // 初始化
        function init() {
            // 为抽取按钮添加事件监听
            drawButton.addEventListener('click', drawMode);
            
            // 获取初始数据
            fetchData();
            
            // 每30秒更新一次数据
            setInterval(fetchData, 30000);
        }
        
        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>`;

// 辅助函数：获取今天的日期字符串（YYYY-MM-DD）
function getToday() {
    return new Date().toISOString().split('T')[0];
}

// 处理API请求
async function handleApiRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (path === '/api/stats') {
        // 获取统计数据
        return handleGetStats(env);
    } else if (path === '/api/draw' && request.method === 'POST') {
        // 处理抽取请求
        return handleDraw(request, env);
    } else {
        return new Response('Not Found', { status: 404 });
    }
}

// 处理获取统计信息的请求
async function handleGetStats(env) {
    try {
        // 从KV获取数据
        const today = getToday();
        const data = await env.MODE_PICKER_KV.get('stats', 'json');
        const history = await env.MODE_PICKER_KV.get('history', 'json') || [];
        
        let responseData = {
            todayDraws: 0,
            totalDraws: 0,
            history: history.slice(0, 20) // 只返回最近20条记录
        };
        
        if (data) {
            // 检查是否是同一天，如果不是则重置今日计数
            if (data.lastDrawDate === today) {
                responseData.todayDraws = data.todayDraws;
            }
            responseData.totalDraws = data.totalDraws;
            responseData.lastResult = data.lastResult;
        }
        
        return new Response(JSON.stringify(responseData), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 处理抽取请求
async function handleDraw(request, env) {
    try {
        const { modes } = await request.json();
        
        if (!modes || !Array.isArray(modes) || modes.length === 0) {
            return new Response(JSON.stringify({ error: 'No modes selected' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 随机选择一个模式
        const randomIndex = Math.floor(Math.random() * modes.length);
        const selectedMode = modes[randomIndex];
        
        const today = getToday();
        
        // 获取当前数据
        let data = await env.MODE_PICKER_KV.get('stats', 'json') || {
            todayDraws: 0,
            totalDraws: 0,
            lastDrawDate: today
        };
        
        let history = await env.MODE_PICKER_KV.get('history', 'json') || [];
        
        // 检查是否是同一天，如果不是则重置今日计数
        if (data.lastDrawDate !== today) {
            data.todayDraws = 0;
            data.lastDrawDate = today;
        }
        
        // 更新计数
        data.todayDraws += 1;
        data.totalDraws += 1;
        data.lastResult = selectedMode;
        
        // 添加到历史记录
        history.unshift({
            mode: selectedMode,
            timestamp: new Date().toISOString()
        });
        
        // 保持历史记录不超过100条
        if (history.length > 100) {
            history = history.slice(0, 100);
        }
        
        // 保存到KV
        await env.MODE_PICKER_KV.put('stats', JSON.stringify(data));
        await env.MODE_PICKER_KV.put('history', JSON.stringify(history));
        
        // 返回响应
        const responseData = {
            lastResult: selectedMode,
            todayDraws: data.todayDraws,
            totalDraws: data.totalDraws,
            history: history.slice(0, 20) // 只返回最近20条记录
        };
        
        return new Response(JSON.stringify(responseData), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to process draw' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Worker主入口
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        // 处理API请求
        if (url.pathname.startsWith('/api/')) {
            return handleApiRequest(request, env);
        }
        
        // 返回HTML页面
        return new Response(HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }
};