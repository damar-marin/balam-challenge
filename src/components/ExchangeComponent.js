import React, { useState, useEffect } from "react";
import axios from "axios";

//Setting up component
const ExchangeComponent = () => {
  const [amount, setAmount] = useState(1);
  const [currency, setCurrency] = useState("MXN");
  const [mxnRate, setMxnRate] = useState(null);
  const [copRate, setCopRate] = useState(null);
  const [estimatedReceive, setEstimatedReceive] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [showCurrencyOptions, setShowCurrencyOptions] = useState(false);
  const [showUsdOptions, setShowUsdOptions] = useState(false);
  const [pctFee, setPctFee] = useState(null); 
  const [fixedFee, setFixedFee] = useState(null); 

  const API_KEY = process.env.REACT_APP_BALAM_API_KEY;

  //API call to get the exchange rate
  const getExchangeRate = async (quoteCurrency) => {
    //Calling API every ten minutes
    const currentTime = Date.now();
    const tenMinutesInMilliseconds = 10 * 60 * 1000;
  
    if (lastFetchTime && currentTime - lastFetchTime < tenMinutesInMilliseconds) {
      console.log("Using cached exchange rates");
      return;
    }
  
    try {
      const options = {
        method: "GET",
        url: "https://api.balampay.com/sandbox/quotes", 
        params: {
          amount: "15", 
          base_currency: "USD", 
          quote_currency: quoteCurrency, 
        },
        headers: {
          Accept: "application/json", 
          "x-api-key": API_KEY, 
        },
      };
  
      const { data } = await axios.request(options); 
  
      if (data && data.data) {
        const rate = data.data.rate; 
        if (quoteCurrency === "MXN") {
          setMxnRate(rate); 
        } else if (quoteCurrency === "COP") {
          setCopRate(rate); 
        }
        setLastFetchTime(currentTime); 
  
        console.log(`Exchange rate for ${quoteCurrency}: ${rate}`);
  
        const pct_fee = data.data.pct_fee;
        const fixed_fee = data.data.fixed_fee;
  
        console.log(`Percentage Fee: ${pct_fee}, Fixed Fee: ${fixed_fee}`);
  
        setPctFee(pct_fee);
        setFixedFee(fixed_fee);
      }
    } catch (error) {
      console.error(error); 
    }
  };  

  // Calculate the amount after subtracting the fees
  const calculateFees = () => {
    let amountAfterPctFee = amount - (amount * pctFee); 
    let amountAfterFixedFee = amountAfterPctFee - fixedFee; 

    if (amountAfterFixedFee < 0) {
      amountAfterFixedFee = 0;
    }

    return amountAfterFixedFee;
  };

  useEffect(() => {
    getExchangeRate("MXN");
    getExchangeRate("COP");
  }, []);

  useEffect(() => {
    const adjustedAmount = calculateFees(); 
    if (currency === "MXN" && mxnRate) {
      setEstimatedReceive((adjustedAmount * mxnRate).toFixed(2)); 
    } else if (currency === "COP" && copRate) {
      setEstimatedReceive((adjustedAmount * copRate).toFixed(2)); 
    }
  }, [amount, currency, mxnRate, copRate, pctFee, fixedFee]); 

  useEffect(() => {
    setAmount(1);
  }, [currency]);

  const toggleCurrencyOptions = () => {
    setShowCurrencyOptions((prev) => !prev);
  };

  const selectCurrency = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setShowCurrencyOptions(false);
  };

  const toggleUsdOptions = () => {
    setShowUsdOptions((prev) => !prev);
  };

  //Component contents
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Tu envías exactamente</h2>
      <div style={styles.inputContainer}>
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            if (value >= 0 || e.target.value === "") { 
              setAmount(e.target.value);
            }
          }}
          style={styles.input}
        />

        <div style={styles.currencyLabel} onClick={toggleUsdOptions}>
          <img
            src={require("../assets/usd_symbol.png")}
            alt="USD Symbol"
            style={styles.currencyImage}
          />
          <span style={styles.currencyText}>USD</span>
          <span style={styles.dropdownArrow}>▼</span>
          {showUsdOptions && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownOption}>
                <img
                  src={require("../assets/usd_symbol.png")}
                  alt="USD Symbol"
                  style={styles.dropdownImage}
                />
                USD
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <div style={styles.quotationFeesContainer}>
        <div style={styles.feeRow}>
          <span style={styles.feeAmount}>
            {pctFee ? `$${(amount * pctFee).toFixed(2)}` : "$0"}
          </span>
          <span style={styles.feeLabelBold}>Percentage quotation fee</span>
        </div>
        <div style={styles.feeRow}>
          <span style={styles.feeAmount}>
            {fixedFee ? `$${fixedFee.toFixed(2)}` : "$0"}
          </span>
          <span style={styles.feeLabel}>Fixed quotation fee</span>
        </div>
        <hr style={styles.divider} />
      </div>

      <div style={styles.rateContainer}>
        <p style={{ textAlign: "left" }}>
          {currency === "MXN"
            ? mxnRate
              ? `$${mxnRate.toFixed(5)} MXN = $1 USD`
              : "Loading..."
            : copRate
            ? `$${copRate.toFixed(5)} COP = $1 USD`
            : "Loading..."}
        </p>
        <span style={styles.rateLabel}>Balam Rate</span>
      </div>
      <p style={styles.rateNote}>*Válido por 10 minutos</p>

      <h2 style={styles.title}>Recibes exactamente</h2>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={estimatedReceive || "0.00"}
          readOnly
          style={styles.input}
        />
        <div style={styles.currencyLabel} onClick={toggleCurrencyOptions}>
          <img
            src={
              currency === "MXN"
                ? require("../assets/mxn_symbol.png")
                : require("../assets/cop_symbol.png")
            }
            alt={`${currency} Symbol`}
            style={styles.currencyImage}
          />
          <span style={styles.currencyText}>{currency}</span>
          <span style={styles.dropdownArrow}>▼</span>
          {showCurrencyOptions && (
            <div style={styles.dropdownMenu}>
              <div
                style={styles.dropdownOption}
                onClick={() => selectCurrency("MXN")}
              >
                <img
                  src={require("../assets/mxn_symbol.png")}
                  alt="MXN Symbol"
                  style={styles.dropdownImage}
                />
                MXN
              </div>
              <div
                style={styles.dropdownOption}
                onClick={() => selectCurrency("COP")}
              >
                <img
                  src={require("../assets/cop_symbol.png")}
                  alt="COP Symbol"
                  style={styles.dropdownImage}
                />
                COP
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <p style={styles.timeText}>
        Tu dinero llega en 15 <span style={styles.boldText}>minutos</span>
      </p>
      <button style={styles.button}>Enviar ahora</button>
      <img
        src={require("../assets/powered_by_balam.png")}
        alt="Powered by Balam"
        style={styles.logoImage}
      />
    </div>
  );
};

//Component styles
const styles = {
  container: {
    width: "487px",
    height: "618px",
    padding: "20px",  
    margin: "auto",
    borderRadius: "10px",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#fff",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  },
  title: {
    fontSize: "17px",  
    fontWeight: "normal", 
    margin: "10px 0",  
    textAlign: "left", 
    color: "#000",  
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    border: "2px solid black",
    borderRadius: "10px",
    padding: "8px 15px",  
    marginBottom: "10px",  
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  input: {
    width: "426px",
    height: "60px",  
    padding: "5px 10px",
    fontSize: "22px",
    fontWeight: "bold",
    textAlign: "left",
    border: "none",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
    color: "#000",  
  },
  currencyLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "20px",  
    fontWeight: "bold",
    fontFamily: "'Inter', sans-serif",
    color: "#000",  
    cursor: "pointer",
    position: "relative",
  },
  currencyImage: {
    width: "25px", 
    height: "25px", 
    marginRight: "5px",
  },
  dropdownArrow: {
    marginLeft: "5px",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "5px",
    width: "100%",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1,
  },
  dropdownOption: {
    padding: "8px 15px",  
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#000",  
  },
  dropdownImage: {
    width: "18px",  
    height: "18px",  
    marginRight: "10px",
  },
  quotationFeesContainer: {
    marginTop: "15px", 
    fontSize: "14px",
    color: "#000", 
  },
  feeRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  feeAmount: {
    fontWeight: "bold",  
    fontSize: "16px", 
    color: "#000",  
  },
  feeLabel: {
    color: "#000",  
  },
  feeLabelBold: {
    fontWeight: "bold",  
    color: "#000",  
  },
  divider: {
    borderTop: "1px solid #ddd",
    margin: "5px 0",  
  },
  rateContainer: {
    display: "flex",
    justifyContent: "space-between", 
    alignItems: "center",
    fontSize: "16px",
    marginTop: "0px",  
    fontWeight: "bold", 
    color: "#000",  
  },
  rateLabel: {
    fontWeight: "bold", 
    textAlign: "right", 
    color: "#000",  
  },
  rateNote: {
    fontSize: "12px",
    color: "#000", 
    textAlign: "left", 
    marginTop: "0px",  
    paddingTop: "0px", 
    lineHeight: "1",   
  },
  timeText: {
    fontSize: "16px",
    marginTop: "5px",  
    textAlign: "left", 
    color: "#000",  
  },
  boldText: {
    fontWeight: "bold",
    color: "#000", 
  },
  button: {
    width: "206px",
    height: "49px",
    borderRadius: "25px", 
    border: "none",
    outline: "none",
    backgroundColor: "#50B361", 
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    alignSelf: "flex-end", 
  },
  logoImage: {
    width: "176px",
    height: "29px", 
    alignSelf: "flex-start",  
  },
  currencyText: {
    fontSize: "24px",  
    fontWeight: "bold",
    marginLeft: "10px", 
    color: "#000", 
  },
};

export default ExchangeComponent;
