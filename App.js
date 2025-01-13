const { useState, useMemo } = React;
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = Recharts;

const StreakSimulator = () => {
    const [params, setParams] = useState({
        days: 365,
        betsPerDay: 1,
        unitSize: 1,
        hitRate: 0.55,
    });

    const runSimulation = () => {
        const results = [];
        const numSimulations = 1000;
        
        for (let sim = 0; sim < numSimulations; sim++) {
            let bankroll = 0;
            let dailyResults = Array(params.days).fill(0);
            
            for (let day = 0; day < params.days; day++) {
                for (let bet = 0; bet < params.betsPerDay; bet++) {
                    const pick1Success = Math.random() < params.hitRate;
                    const pick2Success = Math.random() < params.hitRate;
                    
                    if (pick1Success && pick2Success) {
                        let streakSuccess = true;
                        for (let streakPick = 0; streakPick < 9; streakPick++) {
                            if (Math.random() >= params.hitRate) {
                                streakSuccess = false;
                                break;
                            }
                        }
                        
                        if (streakSuccess) {
                            bankroll += params.unitSize * 1000;
                        } else {
                            bankroll -= params.unitSize;
                        }
                    } else {
                        bankroll -= params.unitSize;
                    }
                    
                    dailyResults[day] = bankroll;
                }
            }
            results.push(dailyResults);
        }
        
        const finalResults = results.map(path => path[path.length - 1]);
        finalResults.sort((a, b) => a - b);
        
        const unluckyIndex = Math.floor(numSimulations * 0.05);
        const medianIndex = Math.floor(numSimulations * 0.5);
        const luckyIndex = Math.floor(numSimulations * 0.95);
        
        const unluckyPath = results.find(path => path[path.length - 1] === finalResults[unluckyIndex]);
        const medianPath = results.find(path => path[path.length - 1] === finalResults[medianIndex]);
        const luckyPath = results.find(path => path[path.length - 1] === finalResults[luckyIndex]);
        
        return {
            chartData: Array(params.days).fill(0).map((_, day) => ({
                day: day + 1,
                unlucky: unluckyPath[day],
                median: medianPath[day],
                lucky: luckyPath[day],
            })),
            roi: {
                unlucky: (finalResults[unluckyIndex] / (params.days * params.betsPerDay * params.unitSize) * 100).toFixed(2),
                median: (finalResults[medianIndex] / (params.days * params.betsPerDay * params.unitSize) * 100).toFixed(2),
                lucky: (finalResults[luckyIndex] / (params.days * params.betsPerDay * params.unitSize) * 100).toFixed(2),
            }
        };
    };

    const simulationResults = useMemo(() => runSimulation(), [params]);

    return React.createElement('div', { className: 'p-4 max-w-6xl mx-auto space-y-6' },
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow-lg' },
            React.createElement('h1', { className: 'text-2xl font-bold mb-6' }, 'Streak Betting Simulator'),
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6' },
                React.createElement('div', { className: 'space-y-4' },
                    ['Days to Simulate', 'Bets Per Day', 'Unit Size ($1-$10)', 'Single Pick Hit Rate (0-1)'].map((label, index) => 
                        React.createElement('div', { key: index },
                            React.createElement('label', { className: 'block text-sm font-medium mb-1' }, label),
                            React.createElement('input', {
                                type: 'number',
                                value: Object.values(params)[index],
                                onChange: (e) => setParams({
                                    ...params,
                                    [Object.keys(params)[index]]: index === 3 ? parseFloat(e.target.value) : parseInt(e.target.value)
                                }),
                                className: 'w-full p-2 border rounded',
                                min: index === 3 ? '0' : '1',
                                max: index === 0 ? '3650' : index === 1 ? '100' : index === 2 ? '10' : '1',
                                step: index === 3 ? '0.01' : '1'
                            })
                        )
                    )
                ),
                React.createElement('div', { className: 'space-y-4' },
                    React.createElement('h3', { className: 'font-medium' }, 'Return on Investment (ROI)'),
                    React.createElement('div', { className: 'grid grid-cols-3 gap-4' },
                        ['Unlucky (5th)', 'Median (50th)', 'Lucky (95th)'].map((label, index) => 
                            React.createElement('div', { key: index },
                                React.createElement('div', { className: 'text-sm text-gray-600' }, label),
                                React.createElement('div', { className: 'text-lg font-semibold' },
                                    `${Object.values(simulationResults.roi)[index]}%`
                                )
                            )
                        )
                    )
                )
            ),
            React.createElement('div', { className: 'h-96' },
                React.createElement(LineChart, {
                    width: 800,
                    height: 400,
                    data: simulationResults.chartData,
                    margin: { top: 5, right: 30, left: 20, bottom: 5 }
                },
                    React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
                    React.createElement(XAxis, { dataKey: 'day' }),
                    React.createElement(YAxis),
                    React.createElement(Tooltip),
                    React.createElement(Legend),
                    React.createElement(Line, { type: 'monotone', dataKey: 'unlucky', stroke: '#ff0000', name: 'Unlucky (5th percentile)' }),
                    React.createElement(Line, { type: 'monotone', dataKey: 'median', stroke: '#0000ff', name: 'Median (50th percentile)' }),
                    React.createElement(Line, { type: 'monotone', dataKey: 'lucky', stroke: '#00ff00', name: 'Lucky (95th percentile)' })
                )
            )
        )
    );
};

ReactDOM.render(
    React.createElement(StreakSimulator),
    document.getElementById('root')
);
