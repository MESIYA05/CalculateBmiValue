
import React , {useState} from 'react'
import './App.css';

const App = () => {
  const [weight,setWeight]=useState()
  const [height,setHeight]=useState()
  const [Bmi,setBmi]=useState(null)
  const [BmiStatus,setBmiStatus]=useState("")
  const [msg,setMsg]=useState("")
  const [WeightError,setWeightError]=useState("")
  const [heightError,setHeightError]=useState("")

  // BMI calculate value
  const claculateBmi=()=>{
      if(weight && height){

          if (isNaN(weight)){
              setWeightError("Please enter valid numeric values for weight!");
              setWeight("")
              return;
          }
          else{
              setWeightError("")
          }

          if (isNaN(height)){
              setHeightError("Please enter valid numeric values for height!");
              setHeight("")
              return;
          }
          else{
              setHeightError("")
          }


       // for bmi value
      const heightMeters=height/100;
      const bmiValue=weight/(heightMeters*heightMeters);
      setBmi(bmiValue.toFixed(2))

      // for bmi status
      if(bmiValue<18.5){
          setBmiStatus("Under weight")
      }
      else if(bmiValue>=18.5 && bmiValue<25){
          setBmiStatus("Normal weight")
      }
      else if(bmiValue>=25 && bmiValue<30){
          setBmiStatus("Over weight")
      }
      else if(bmiValue>=30 && bmiValue<35){
          setBmiStatus("Obese Class I")
      }
      else{
          setBmiStatus("Obese Class II")
      }
     
      setMsg("")


  }
      else{
          setMsg("Please enter the datas !")
          setWeight("")
          setHeight("")
          setBmi(null)
          setBmiStatus("")
      }
  }
  function clear(){
      setWeight("")
          setHeight("")
          setBmi(null)
          setBmiStatus("")
  }
  return (
    <>
         <div className='container'>
    <div className='container1'>
        <h1 className='text'>CALCULATE YOUR BMI</h1>
    </div>
    <div className='fullbody'>
        <div className='content'>
        <label htmlFor="" className='label'>Enter your weight</label>
       
       <input type="text" onChange={(e)=>{setWeight(e.target.value)}} value={weight} placeholder='In kg'/>
       <h6 >{WeightError}</h6>
       <label htmlFor="" className='label'>Enter your height</label>
       <input type="text" onChange={(e)=>{setHeight(e.target.value)}}  value={height} placeholder='In cm'/>
       <h6 >{heightError}</h6>
       <h6 >{msg}</h6>
        </div>
        <div className='' id='bottn'>
        <button className='btn ' onClick={()=>{claculateBmi()}}>Calculate </button>
        <button className='btn' onClick={clear}>Clear</button>
        </div>
        {Bmi!=null &&
    <div className='msg'>
        <h4>Your BMI result value is : <p>{Bmi}</p></h4>
        <h4>Your BMI result status is : <p>{BmiStatus}</p> </h4>
    </div>

    }
    </div>
    
    
    </div>
   
    </>
  )
}

export default App



