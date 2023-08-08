import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTransactions } from '../../store/transaction';
import { getStocks } from '../../store/stock';
import './transaction.css';

function TransactionPage() {
    const dispatch = useDispatch();
    const sessionUser = useSelector(state => state?.session?.user);
    const transactionsObj = useSelector(state => state?.transaction?.entries)
    const companiesObj = useSelector(state => state?.stock?.entries)
    const companiesArr = Object.values(companiesObj)
    const transactions = Object.values(transactionsObj ? transactionsObj : {})
    const userId = sessionUser.id;

    // Find ticker from transaction that matches with the pool of companies in database
    const matchTicker = (companyId) => {
        for (let stock of companiesArr) {
            if (stock?.id === companyId) {
                return stock.ticker
            }
        }
    }

    function sortByDate (a, b) {
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let aMonth = Number(months.indexOf(a.date.slice(8, 11)))
        let bMonth = Number(months.indexOf(b.date.slice(8, 11)))
        let aYear = Number(a.date.slice(12, 16))
        let bYear = Number(b.date.slice(12, 16))
        let aDay = Number(a.date.slice(5, 7))
        let bDay = Number(b.date.slice(5, 7))

        if (aYear < bYear) return 1
        if (aYear > bYear) return -1
        if (aYear === bYear && aMonth < bMonth) return 1
        if (aYear === bYear && aMonth > bMonth) return -1
        if (aYear === bYear && aMonth === bMonth && aDay < bDay) return 1
        if (aYear === bYear && aMonth === bMonth && aDay > bDay) return -1
        return 0
    }

    useEffect(() => {
        dispatch(getStocks());
        dispatch(getAllTransactions());
    }, [dispatch])

    return (
        <>
            <div className='transaction-container'>
                <h1 className='TitleTransactions'>Transactions</h1>
                <div className='transaction-table'>
                    {transactions.sort(sortByDate) ?
                        (
                            <table>
                                <div>
                                    {transactions.map(transaction => {
                                        if (transaction.userId === userId) {
                                            return (<div key={transaction.id} className={(transaction?.type === "sell") ? 'sell' : 'buy'}>
                                                {/* <td>{companiesObj && companiesObj[transaction.companyId].ticker}</td> */}
                                                <div>
                                                    <div className='transactionColumn'>
                                                        <div className='transaction-page-transaction-details-container'>
                                                            <div className='transaction-page-ticker-price-buy-sell-container'>
                                                                {matchTicker(transaction.companyId)}
                                                            </div>
                                                            <div className='transaction-page-transaction-date'>
                                                                {transaction?.date.slice(8, 11)} {transaction?.date.slice(5, 7)}, {transaction?.date.slice(12, 16)}
                                                            </div>
                                                            <div className='transaction-page-transaction-stock-price'>
                                                                ${Number(transaction?.price / transaction?.shares).toFixed(2)}
                                                            </div>
                                                            <div className='transaction-page-transaction-buy-sell'>
                                                                {transaction?.type.toUpperCase() === "BUY" ? <div style={{ "color": "darkgreen" }}>Buy</div> : <div style={{ "color": "red" }}>Sell</div>}
                                                            </div>
                                                            <div className='transaction-page-transaction-total-price'>
                                                                {transaction?.type.toUpperCase() === "BUY" ? <div style={{ "color": "darkgreen" }}>+${Number(transaction?.price).toFixed(2)}</div> : <div style={{ "color": "red" }}>-${Number(transaction?.price).toFixed(2)}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>)
                                        }
                                    })}
                                </div>
                            </table>
                        ) :
                        (<div>You don't have any transactions yet.</div>)}
                </div>
            </div>
        </>
    )

}

export default TransactionPage;
