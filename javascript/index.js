
function weatherAppSimple(){
    //navbar active code
   const navbar = document.querySelector('.navbar')
   const navbarToggle = document.querySelector('.toggle-button');
   const navbarLinks = document.querySelector('.navbar-links');

   navbarToggle.addEventListener('click', () => {
       navbarLinks.classList.toggle('active')
   })

   const outputDiv = document.querySelector('.output');
   const locationSerach = document.getElementById('location-search');
   const loader = document.querySelector('.loader');
   let weatherIconImage = document.querySelector('.icon');
   const infoText = document.querySelector('.info');
   const metricButton = document.querySelector('.metric');
   const weeklyContainer = document.querySelector('.weekly-container');
   let celciusEntityCode = `&#8451;`;
   let fahrenheitHtmlEntityCode = `&#8457;`;
   let isCelcius = true;
   let location = {
        place: null,
   }
   let retievedData;

   let key = '73fd6fae4f6c38b406133a41eee3ec55'; //openweatherapi

   weeklyContainer.style.visibility = 'hidden';

   function setUp(){
        locationSerach.addEventListener('keyup', (e) => {
            const keypressed = e.key;
            console.log(keypressed)
            if(keypressed === 'Enter'){
                location.place = locationSerach.value;
                locationSerach.value = '';
                locationSerach.blur();
                loader.style.visibility = 'visible';
                if(loader.style.visibility === 'visible'){
                    weatherIconImage.style.visibility = 'hidden';
                    infoText.style.visibility = 'hidden'
                    weeklyContainer.style.visibility = 'hidden';
                }
                return getLatAndLong(location.place)
                .then((data) => {
                    console.log(data)
                    return buildCoicesList(data)
                })
                .then(data => {
                    console.log(data)
                    return getData(data)
                })
                .then((data) => {
                    console.log(data)
                    return showWeatherIcons(data)
                })
                .then((data) => {
                    return weatherIconLookup(data)
                })
                .then((data) => {
                    console.log(data)
                    return twodayForecast(data)
                })
            }
        })
   }

   async function getData(locationObj){
        console.log(locationObj)
        let loc = locationObj.cityName;
        let lat = locationObj.lat;
        let long = locationObj.long;
        let time = new Date().getTime();
        console.log(time)


        const options = { // weather api for 2 day forecast
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'd14dc8a9afmsh262d623df38d149p11800ajsn39b3752b67e8',
                'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
            }
        };
        
        try {
            const getDataMetric = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${key}`)
            const getImperialdata = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=${key}`)
            const getWeeklyData = await  fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${lat},${long}&days=3`, options)
            const json = await getDataMetric.json()
            const imperialJson = await getImperialdata.json()
            const weeklyJson = await getWeeklyData.json()
            loader.style.visibility = 'hidden';
            weeklyContainer.style.visibility = 'visible';
            console.log(weeklyJson)
            retievedData = {

                cityID: json.id,
                description: json.weather[0].description,
                temp: json.main.temp,
                tempFahrenheit: imperialJson.main.temp,
                feelsLike: json.main.feels_like,
                tempMaxMin: [json.main.temp_max, json.main.temp_min],
                humidity: json.main.humidity,
                airPressure: json.main.pressure,
                name: json.name,
                country: json.sys.country,
                wind: json.wind,
                windImperial: imperialJson.wind,
                sunrise: json.sys.sunrise,
                sunset: json.sys.sunset,
                weather: json.weather[0].description,
                weatherMain: json.weather[0].main,
                weatherIcnCode: json.weather[0].icon,
                timezoneSecs: json.timezone,
                tZone: locationObj.timezone,
                dt: json.dt,
                weather: json.weather,
                threeDayForecastTwoDate: formatDate(weeklyJson.forecast.forecastday[1].date),
                threeDayForecastTwoCondition: weeklyJson.forecast.forecastday[1].day.condition,
                threeDayForecastTwoAvTemp: [weeklyJson.forecast.forecastday[1].day.avgtemp_c, weeklyJson.forecast.forecastday[1].day.avgtemp_f],
                threeDayForecastTwoMaxTemp: [weeklyJson.forecast.forecastday[1].day.maxtemp_c, weeklyJson.forecast.forecastday[1].day.maxtemp_f],
                threeDayForecastTwoMinTemp: [weeklyJson.forecast.forecastday[1].day.mintemp_c, weeklyJson.forecast.forecastday[1].day.mintemp_f],
                threeDayForecastThreeDate: formatDate(weeklyJson.forecast.forecastday[2].date),
                threeDayForecastThreeCondition: weeklyJson.forecast.forecastday[2].day.condition,
                threeDayForecastThreeAvTemp: [weeklyJson.forecast.forecastday[2].day.avgtemp_c, weeklyJson.forecast.forecastday[2].day.avgtemp_f],
                threeDayForecastThreeMaxTemp: [weeklyJson.forecast.forecastday[2].day.maxtemp_c, weeklyJson.forecast.forecastday[2].day.maxtemp_f],
                threeDayForecastThreeMinTemp: [weeklyJson.forecast.forecastday[2].day.mintemp_c, weeklyJson.forecast.forecastday[2].day.mintemp_f],
            }

            let hideDropDown = document.querySelector('.location-popup');
            hideDropDown.style.visibility = 'hidden'
            weatherIconImage.style.visibility = 'visible';
            return retievedData
        } catch (error) {
        
        }
   
    }

   async function getLatAndLong(city){
        console.log(city)

        // call opencage api 
        let key = 'c2788aa3f323458b977e3e592dbafd89'
        let data;
    
        let resObj = {
            names: []
        }
 
        try {
    
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${key}`)
            const json = await response.json()
            
            if(json.rate.remaining === 0){
                throw new Error();
            }
    
            if(json.results.length > 1){
    
                for(let res in json.results){
                    resObj.names.push({rateApiCalls: json.rate, nme: json.results[res].formatted, lat: json.results[res].geometry.lat, long: json.results[res].geometry.lng, continent: json.results[res].components.continent, country:json.results[res].components.country,   state: json.results[res].components.state,  timezone: json.results[res].annotations.timezone.name, cityName: city })
                }
            }
            
            return resObj

        } catch (error) {
            setTimeout(() => {
                console.log(error)
                if(data.rate.remaining === 0){
                    throw alert('you have reached your monthly allowance - please contact us to discuss payment plans');
                    }
                alert('error1 - try again')
                }, 2000);
            }
        }
   
    function twodayForecast(obj){
        const weeklyContainer = document.querySelector('.weekly-container');
        const dayOneDiv = document.querySelector('.dayOne')
        const dayTwoDiv = document.querySelector('.dayTwo')

        // day one data
        let img1 = dayOneDiv.firstElementChild;
        img1.src = obj.threeDayForecastTwoCondition.icon;
        let daydate1 = dayOneDiv.firstElementChild.nextElementSibling
        daydate1.textContent = obj.threeDayForecastTwoDate;
        let day1maxtemp = dayOneDiv.firstElementChild.nextElementSibling.nextElementSibling
        day1maxtemp.innerHTML = `Max-temp: ${obj.threeDayForecastTwoMaxTemp[0]}${celciusEntityCode} `// celcius
        let day1mintemp = dayOneDiv.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling;
        day1mintemp.innerHTML = `Min-temp: ${obj.threeDayForecastTwoMinTemp[0]}${celciusEntityCode} `// celcius
        let day1description = dayOneDiv.lastElementChild;
        day1description.textContent = obj.threeDayForecastTwoCondition.text; 

        // day two data
        let img2 = dayTwoDiv.firstElementChild;
        img2.src = obj.threeDayForecastThreeCondition.icon;
        let daydate2 = dayTwoDiv.firstElementChild.nextElementSibling;
        daydate2.textContent = obj.threeDayForecastThreeDate;
        let day2maxtemp = dayTwoDiv.firstElementChild.nextElementSibling.nextElementSibling;
        day2maxtemp.innerHTML = `Max-temp: ${obj.threeDayForecastThreeMaxTemp[0]}${celciusEntityCode}`;
        let day2mintemp = dayTwoDiv.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling;
        day2mintemp.innerHTML = `Min-temp: ${obj.threeDayForecastThreeMinTemp[0]}${celciusEntityCode}`;
        let day2description = dayTwoDiv.lastElementChild;
        day2description.textContent = obj.threeDayForecastThreeCondition.text;

    }
        
    function convertToImperial(cel){
        //Formula (°C x 9/5) + 32
        let fahr = (cel * 9/5) + 32;
        return fahr;
    }
   

   function buildCoicesList(obj){
        
        infoText.style.visibility = 'hidden'

        let objToReturn;
        const popUpForm = document.createElement('div');
        popUpForm.classList.add('location-popup');
        const locForm = document.createElement('form');
        locForm.id = 'locForm'
        locForm.name = 'locForm'
        const locChoiceLabel = document.createElement('label');
        locChoiceLabel.setAttribute('for', 'chooseLoc');
        locChoiceLabel.textContent = 'Please choose your required location from the dropdown list'
        const selectLocation = document.createElement('select');
        selectLocation.id = 'chooseLoc'
        selectLocation.name = 'chooseLoc'
    
        const selectOne = document.createElement('option')
        selectOne.value = 'select one'
        let emptyValue = document.createElement('option');
        emptyValue.textContent = 'please select your location';
        selectLocation.appendChild(emptyValue)
        for(let i=0; i<obj.names.length; i++){
            let options = document.createElement('option');
            options.value = obj.names[i].nme;
            options.textContent = obj.names[i].nme
       
            selectLocation.appendChild(options)
    }

        locForm.appendChild(locChoiceLabel)
        locForm.appendChild(selectLocation)
        popUpForm.appendChild(locForm)
        outputDiv.appendChild(popUpForm)

        return new Promise((res) => {
            console.log()
            selectLocation.addEventListener('change', () => {
                for(let item of obj.names){
                    if(selectLocation.value === item.nme){
                        popUpForm.style.visibility = 'hidden'
                        locationSerach.value = ''
                        return res(item)
                    }
                }
            })
        })   
    }

    function showWeatherIcons(data){
        console.log(data.weather)
    
        let weatherCodes = {
            thunderstorm: {
                main: 'Thunderstorm',
                id: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
                icon: ['11d'],
                icinImg: `assets/icons/png/Thunderstorms.png`
            },
            drizzle: {
                main: 'Drizzle',
                id: [300, 301, 302, 310, 311, 312, 313, 314, 321],
                icon: ['09d'],
                icinImg: `assets/icons/png/Light-Showers.png`
            },
            rain: {
                main: 'Rain',
                id: [500, 501, 502, 503, 504, 511, 520, 521, 522, 531],
                icon: ['10d', '13d', '09d'],
                icinImg: `assets/icons/png/rain.png`
            },
            snow: {
                main: 'Snow',
                id: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
                icon: ['13d'],
                icinImg: `assets/icons/png/snow.png`
            },
            atmosphere: {
                main: ['Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash', 'Squall', 'Tornado'],
                id: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
                icon: ['50d'],
                icinImg: `assets/icons/png/fog.png`
            },
            clear: {
                main: 'Clear',
                id: [800],
                icon: ['01d'],
                icinImg: `assets/icons/png/Sunny.png`
            },
            clouds: {
                main: 'Clouds',
                id: [801, 802, 803, 804],
                icon: ['02d', '03d', '04d'],
                icinImg: `assets/icons/png/clouds1.png`
            }
        }

        let weatherCondition = data.weather[0].main;
        console.log(weatherCondition)

        let atmosphereChoices;

        for(let i=0; i<weatherCodes.clear.main.length; i++){
            atmosphereChoices = weatherCodes.clear.main[i];
        }

        switch(data.weather[0].main){
            case 'Clouds':
                weatherIconImage.src = `${weatherCodes.clouds.icinImg}`;
                break;
            case 'Clear':
                weatherIconImage.src = `${weatherCodes.clear.icinImg}`;
                break;
            case atmosphereChoices:
                weatherIconImage.src = `${weatherCodes.atmosphere.icinImg}`;
                break;
            case 'Snow':
                weatherIconImage.src = `${weatherCodes.snow.icinImg}`;
                break;
            case 'Rain':
                weatherIconImage.src = `${weatherCodes.rain.icinImg}`;
                break;
            case 'Drizzle':
                weatherIconImage.src = `${weatherCodes.drizzle.icinImg}`;
                break;
            case 'Thunderstorm':
                weatherIconImage.src = `${weatherCodes.thunderstorm.icinImg}`;
                break;
            default:
                weatherIconImage.src = `${weatherCodes.clear.icinImg}`;
        }

        console.log(weatherIconImage)
        return data;
    }

    function weatherIconLookup(data){
        
        let place = document.querySelector('.place');
        let timeNow = document.querySelector('.timeNow');
        let temperature = document.querySelector('.temp');
        let description = document.querySelector('.description');
        let humidity = document.querySelector('.humid');
        let airpres = document.querySelector('.airpress');
        let windspeed = document.querySelector('.wind');
        let sunRise = document.querySelector('.sunrise');
        let sunset = document.querySelector('.sunset');
    
        infoText.style.visibility = 'visible';

        place.textContent = `${data.name}, ${data.country}`;
        timeNow.textContent = `Date & time: ${timeAndDay(data.tZone)}`;
        description.textContent = `${data.description}`;
        temperature.innerHTML = `Temperature: ${data.temp}${celciusEntityCode}`;
        humidity.innerHTML = `Humidity: ${data.humidity}%rh`;
        airpres.textContent = `Air-pressure: ${data.airPressure}mb`;
        windspeed.textContent = `Windspeed: ${data.wind.speed}m/s`;
        sunRise.textContent = `Sunrise: ${convertUTCtoTime(data.sunrise, data.tZone)}`;
        sunset.textContent = `Sunset: ${convertUTCtoTime(data.sunset, data.tZone)}`;

        useablecityID = data.cityID;
        
        return data 
    }

    function timeAndDay(tzone){
        // get local time and date from location input
        let options = {
            timeZone: `${tzone}`,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          },
          formatter = new Intl.DateTimeFormat([], options);
          return formatter.format(new Date());      
    }


    function convertUTCtoTime(time, tzone){
        console.log()
        let date = new Date(time*1000);
        let options = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
            timezone: `${tzone}`
        }

        let rightTime = date.toLocaleString("en-US", {timeZone: `${options.timezone}`});
        let split = rightTime.split(',')
    
        return split[1];
    }

    function tog(unit){
        let temperature = document.querySelector('.temp');
        let windspeed = document.querySelector('.wind');
    
        let day1minMax = [document.querySelector('.dayOne :nth-child(3)'), document.querySelector('.dayOne :nth-child(4)')];
        let day2minMax = [document.querySelector('.dayTwo :nth-child(3)'), document.querySelector('.dayTwo :nth-child(4)')];

        console.log(day1minMax)
        console.log(day2minMax)

        if(unit === true){
            temperature.innerHTML = `Temperature: ${retievedData.temp}${celciusEntityCode}`
            windspeed.innerHTML = `Windspeed: ${retievedData.wind.speed}m/s`
            day1minMax[0].innerHTML = `Max-temp: ${retievedData.threeDayForecastTwoMaxTemp[0]}${celciusEntityCode}`
            day1minMax[1].innerHTML = `Min-temp: ${retievedData.threeDayForecastTwoMinTemp[0]}${celciusEntityCode}`
            day2minMax[0].innerHTML = `Max-temp: ${retievedData.threeDayForecastThreeMaxTemp[0]}${celciusEntityCode}`
            day2minMax[1].innerHTML = `Min-temp: ${retievedData.threeDayForecastThreeMinTemp[0]}${celciusEntityCode}`
        }else{
            temperature.innerHTML = `Temperature: ${retievedData.tempFahrenheit}${fahrenheitHtmlEntityCode}`
            windspeed.innerHTML = `Windspeed: ${retievedData.windImperial.speed}mph`
            day1minMax[0].innerHTML = `Max-temp: ${retievedData.threeDayForecastTwoMaxTemp[1]}${fahrenheitHtmlEntityCode}`
            day1minMax[1].innerHTML = `Min-temp: ${retievedData.threeDayForecastTwoMinTemp[1]}${fahrenheitHtmlEntityCode}`
            day2minMax[0].innerHTML = `Max-temp: ${retievedData.threeDayForecastThreeMaxTemp[1]}${fahrenheitHtmlEntityCode}`
            day2minMax[1].innerHTML = `Min-temp: ${retievedData.threeDayForecastThreeMinTemp[1]}${fahrenheitHtmlEntityCode}`
        }
    }

    function formatDate(dte){
        let date = new Date(dte).toDateString()
        console.log(date)
        return date;
    }

  
   // begin app
   setUp()
   metricButton.addEventListener('click', () => {

    if(isCelcius){
        isCelcius = false;
    }else{
        isCelcius = true;
    }
    return tog(isCelcius)
})
}
document.addEventListener('DOMContentLoaded', weatherAppSimple)