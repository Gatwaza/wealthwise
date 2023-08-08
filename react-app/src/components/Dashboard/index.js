import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStockPrices, getStocks } from '../../store/stock';
import { getTransactions, getAllTransactions, getBoughtTransactions } from '../../store/transaction';
import { getPortfolio, getAssetPrices, getAssetClosingPrices } from '../../store/portfolio';
import WatchlistPage from '../Watchlist'
import WatchlistForm from '../WatchlistForm';
import AddMoneyCurrentBalance from '../AddMoneyCurrentBalance'
import { getGeneralNews } from '../../store/news';
import MarketNews from '../MarketNews';
import AssetTable from '../AssetTable';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import './Dashboard.css'

const Dashboard = () => {
    const dispatch = useDispatch()
    const assetPriceRef = useRef()
    const currentUser = useSelector(state => state?.session?.user);
    const stocks = useSelector(state => state?.stock?.entries)
    const transactions = useSelector(state => state?.transaction?.boughtTrans)
    const closingPrices = useSelector(state => state?.portfolio?.closing)
    const closingPricesArr = Object.values(closingPrices)

    const portfolioPrices = useSelector(state => state?.portfolio?.entries)
    const news = useSelector(state => state?.news?.entries)
    // const assetPrices = useSelector(state => state?.portfolio?.prices)
    const boughtTransactions = useSelector(state => state?.transaction?.entries)

    const companies = Object.values(stocks)
    const transArr = Object.values(transactions)
    const portfolio = Object.values(portfolioPrices)
    const allBoughtTransArr = Object.values(boughtTransactions)
    const newsArr = Object.values(news)
    const options = { style: 'currency', currency: 'USD' };
    const currencyFormat = new Intl.NumberFormat('en-US', options);
    let portfolioBalance = 0

    const [newData, setNewData] = useState(portfolio)
    const [currPrice, setCurrPrice] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Force the page to scroll up to top on mount
        window.scrollTo(0, 0)

        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 1000)
    }, [])

    useEffect(() => {
        dispatch(getGeneralNews())
        dispatch(getAllTransactions())
        dispatch(getBoughtTransactions(currentUser?.id))
        dispatch(getStocks())
        dispatch(getPortfolio())
        setNewData(portfolio)
    }, [dispatch, currentUser])

    useEffect(() => {
        dispatch(getAssetClosingPrices())
    }, [dispatch, currentUser, transArr.length])

    useEffect(() => {
        createData('1w')
        setNewData(portfolio?.slice(-7))
    }, [portfolio?.length, currentUser])

    // Total money you put in to buy shares
    const totalFunds = () => {
        let total = 0
        for (let compId in boughtTransactions) {
            let transaction = boughtTransactions[compId]
            total += transaction.price * transaction.shares
        }
        return total
    }


    // Returns the total price of ALL the stocks you own for the day.
    const buyingTotal = () => {
        let total = 0
        for (let compId in closingPrices) {
            // When trading, add to the total.
            // If selling all of the stocks, compId will not exist in closingPrices anymore
            // So continue on with for loop.
            if (transactions[compId]?.shares) {
                total += closingPrices[compId]?.price * transactions[compId]?.shares
            }
        }
        return total
    }

    const createData = (time) => {
        if (time === '1y') {
            setNewData(portfolio)
            return newData
        }
        if (time === '1w') {
            setNewData(portfolio?.slice(-7))
            return newData
        }
        if (time === '1m') {
            setNewData(portfolio?.slice(-30))
            return newData
        }
        if (time === '3m') {
            setNewData(portfolio?.slice(-90))
            return newData
        }
        if (time === '6m') {
            setNewData(portfolio?.slice(-(Math.floor(portfolio?.length / 2))))
            return newData
        }
    }

    const lineMouseOver = (price) => {
        if (price) {
            setCurrPrice(price?.toFixed(2))
        } else {
            if (portfolioBalance) {
                setCurrPrice(portfolioBalance)
            }
        }
    }

    // Customized tooltip to show price and date
    const customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-price">{`$${((payload[0].value)).toFixed(2)}`}</p>
                    <p className="tooltip-date">{label}</p>
                </div>
            );
        }
        return null;
    }

    return (
        <>
            {isLoading
            ? <div className='loading-ctn'>
                <div className='loading'></div>
            </div>
            :
            <div id='portfolio-ctn'>
                <h1 className='your-assets-heading'>Your assets</h1>
                {/* -------------------- ASSETS GRAPH -------------------- */}
                <div className='portfolio-graph'>
                    <div className='balance-info'>
                        <div className='balance-label'>Balance</div>
                        <div className='balance-amt'>
                            {/* If hovering over the graph, update the balance amount. Otherwise, default to the most recent price */}
                            {currPrice ? `${currencyFormat.format(currPrice)}` : currencyFormat.format(portfolioPrices['364']?.price)}
                        </div>
                        <div className='balance-percent'>
                            {(buyingTotal() > totalFunds()) ?
                                <div className='all-time-diff' style={{ color: 'green' }}>
                                    +{currencyFormat.format(Math.abs((buyingTotal() - totalFunds())).toFixed(2))}
                                </div>
                                :
                                <div className='all-time-diff' style={{ color: 'red' }}>
                                    -{currencyFormat.format(Math.abs((buyingTotal() - totalFunds())))}
                                </div>
                            }
                            <div className='all-time'>All time</div>
                        </div>
                    </div>
                    {/* -------------------- LINE CHART HERE -------------------- */}
                    <div className='asset-chart'>
                        <LineChart
                            width={950}
                            height={300}
                            data={newData}
                            onMouseMove={(e) => lineMouseOver(e?.activePayload && e?.activePayload[0].payload.price)}
                        >
                            <XAxis dataKey="date" hide='true' />
                            <YAxis dataKey="price" domain={['dataMin', 'dataMax']} hide='true' />
                            <ReferenceLine y={totalFunds()} stroke="gray" strokeDasharray="3 3" />
                            <Tooltip
                                cursor={false}
                                content={customTooltip}
                            />
                            <Line
                                type="linear"
                                dataKey="price"
                                stroke="#0b7cee"
                                activeDot={{ r: 5 }}
                                dot={false}
                                animationDuration={500}
                                strokeWidth={2}
                            />
                        </LineChart>
                    </div>
                    <div className='asset-bottom'>
                        <div className='asset-timeframe'>
                            <span className='weekly'>
                                <button
                                    value='1w'
                                    className='weekly-btn'
                                    onMouseDown={e => createData(e.target.value)}
                                >
                                    1W
                                </button>
                            </span>
                            <span className='monthly'>
                                <button
                                    value='1m'
                                    className='monthly-btn'
                                    onMouseDown={e => createData(e.target.value)}
                                >
                                    1M
                                </button>
                            </span>
                            <span className='three-months'>
                                <button
                                    value='3m'
                                    className='three-months-btn'
                                    onMouseDown={e => createData(e.target.value)}
                                >
                                    3M
                                </button>
                            </span>
                            <span className='six-months'>
                                <button
                                    value='6m'
                                    className='six-months-btn'
                                    onMouseDown={e => createData(e.target.value)}
                                >
                                    6M
                                </button>
                            </span>
                            <span className='one-year'>
                                <button
                                    value='1y'
                                    className='one-year-btn'
                                    onMouseDown={e => createData(e.target.value)}
                                >
                                    1Y
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
                <div id='info'>
                    <div id='left'>
                        {/* -------------------- OWNED STOCKS -------------------- */}
                        <AssetTable
                            currentUser={currentUser}
                            stocks={stocks}
                            companies={companies}
                            closingPrices={closingPrices}
                            closingPricesArr={closingPricesArr}
                            transArr={transArr}
                            currencyFormat={currencyFormat}
                            buyingTotal={buyingTotal}
                        />
                        {/* -------------------- NEWS -------------------- */}
                        <div className='news-ctn'>
                            <MarketNews news={newsArr} />
                        </div>
                    </div>
                    <div id='right'>
                        {/* -------------------- WATCHLIST -------------------- */}
                        <div className='watchlist-form'>
                            <AddMoneyCurrentBalance />
                            <WatchlistForm />
                            <WatchlistPage currencyFormat={currencyFormat}/>
                        </div>
                    </div>
                </div>
            </div>
            }
        </>
    )
}

export default Dashboard
