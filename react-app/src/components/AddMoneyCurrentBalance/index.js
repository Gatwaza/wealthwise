import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { addMoneyToCurrentBalance } from '../../store/transaction'
import {getUserInformation} from '../../store/session'
import './AddMoneyCurrentBalance.css';



function AddMoneyCurrentBalance() {
    const dispatch = useDispatch();
    const state = useSelector((state) => state);
    const user = useSelector(state => state.session?.user)
    const userId = useSelector(state => state.session?.user.id)
    const [balance, setBalance] = useState(0)
    const [buyingPower, setBuyingPower] = useState(user.balance)
    const [errors, setErrors] = useState([]);
    const [show, setShow] = useState(false);
    const options = { style: 'currency', currency: 'USD' };
    const currencyFormat = new Intl.NumberFormat('en-US', options);

    useEffect(() => {
        const error = [];
        if (balance < 1) {
            error.push('You can NOT put a value less than 1')
        }

        setErrors(error);
    }, [balance]);

    useEffect(()=>{
        setBuyingPower(user.balance)
    },[user])
    const onSubmit = async (e) => {
        e.preventDefault()
        if(errors.length > 0){
            setShow(true)
            return
        }
        if (errors.length === 0) {

            const payload = {
                userId,
                balance

            }
            await dispatch(addMoneyToCurrentBalance(payload))
            await dispatch(getUserInformation())
            await setBalance('')
            await setBuyingPower(Number(balance) + buyingPower)
        }
    }

    return (
        <div className='AddMoneyCurrentBalanceForm'>
            <div className='buying-power-headings'>
                <h2 className='buying-power-inForm'>Buying Power:</h2>
                <h2 className='buying-power-inForm'>{currencyFormat.format(buyingPower)}</h2>
            </div>
            {show ?
            <div>

            {errors.length > 0 ?
                <>
                    <ul className='errorsArray'>{errors.map(error => {
                        return (
                            <>
                                <li className='WatchlistFormErrorItem'
                                    key={error}>{error}</li>
                            </>
                        )
                    })}
                    </ul>
                </>
                : null}
                </div>
                    : null}
            <form onSubmit={onSubmit} className='add-money-form'>
                <input type='number'
                    placeholder={`Add to Buying Power`}
                    className='inputBox'
                    // value={balance}
                    onChange={(e) => {
                        setBalance(e.target.value)}}
                />
                <button
                    className='AddMoneySubmitButton'
                    type='submit'
                    // disabled={errors.length > 0 ? true : false}
                >Submit</button>
            </form>

        </div >
    )
}


export default AddMoneyCurrentBalance;
