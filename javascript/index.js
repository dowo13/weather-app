// a simple weather app using fetch api

function weatherAppSimple(){
    //navbar active code
    const navbar = document.querySelector('.navbar')
    const navbarToggle = document.querySelector('.toggle-button');
    const navbarLinks = document.querySelector('.navbar-links');

    navbarToggle.addEventListener('click', () => {
        navbarLinks.classList.toggle('active')
    })

    const locationSerach = document.getElementById('location-search');
    const loader = document.querySelector('.loader');
    let weatherIconImage = document.querySelector('.icon');
    const infoText = document.querySelector('.info');
    const metricButton = document.querySelector('.metric');
    let isCelcius = true;
    let location;
    let retievedData;

    let key = '73fd6fae4f6c38b406133a41eee3ec55';

   
    function setUpLocation(){

        locationSerach.addEventListener('keyup', (e) => {
            e.preventDefault();
            let keypressed = e.key;
            console.log(keypressed)
            if(keypressed === 'Enter'){
                location = locationSerach.value;
                console.log(location)
                locationSerach.value = '';
                locationSerach.blur();
                loader.style.visibility = 'visible';
                if(loader.style.visibility === 'visible'){
                    weatherIconImage.style.visibility = 'hidden';
                    infoText.style.visibility = 'hidden'
                }
                getLatAndLong(location) // get lat and long from opencage api
                .then((data) => {
                    
                    return parseLatAndLongData(data)
                })
                .then((data) => {
                    console.log(data)
                   
                    return fecthWeatherData(data)
                })
                .then((data) => {
                    console.log(data)
                    weatherIconImage.style.visibility = 'visible';
                    return showWeatherIcons(data)
                })
                .then((data) => {
                    return weatherIconLookup(data)
                })
            }
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

    async function fecthWeatherData(obj){
        let loc = obj.cityName
        let resObj;
        try {

            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&appid=${key}`)
            const resImperialUnits = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=imperial&appid=${key}`)
            const json = await response.json()
            const imperialJson = await resImperialUnits.json()
            console.log(json)
            console.log(imperialJson)
            loader.style.visibility = 'hidden';

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
                tZone: obj.timezone,
                dt: json.dt,
                weather: json.weather
            }

            return retievedData;
            
        } catch (err) {
            loader.style.visibility = 'visible';
            console.log(err)
            setTimeout(() => {
                alert('Error - please try again')
            }, 2000)
        }

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

    async function getLatAndLong(city){
        // call opencage api 
        let key = 'c2788aa3f323458b977e3e592dbafd89';
        let data;
        try {
            
            const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${key}`)
            const json = await response.json()
            
            data = {
                apiCallsRemaining: json.rate,
                lat: json.results[0].geometry.lat,
                long: json.results[0].geometry.lng,
                continent: json.results[0].components.continent,
                country: json.results[0].components.country,
                state: json.results[0].components.state,
                timezone: json.results[0].annotations.timezone.name,
                cityName: city 
            }
            if(json.rate.remaining === 0){
                throw new Error();
            }
            return data;
           
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

    function parseLatAndLongData(obj){
        console.log(obj)
        return obj;
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
       

        let celciusEntityCode = `&#8451;`;
    
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

    function tog(unit){
        let temperature = document.querySelector('.temp');
        let windspeed = document.querySelector('.wind');
        let celciusEntityCode = `&#8451;`;
        let fahrenheitHtmlEntityCode = `&#8457;`;

        if(unit === true){
            temperature.innerHTML = `Temperature: ${retievedData.temp}${celciusEntityCode}`
            windspeed.innerHTML = `Windspeed: ${retievedData.wind.speed}m/s`
        }else{
            temperature.innerHTML = `Temperature: ${retievedData.tempFahrenheit}${fahrenheitHtmlEntityCode}`
            windspeed.innerHTML = `Windspeed: ${retievedData.windImperial.speed}mph`
        }
    }

    // start app
    setUpLocation();
    metricButton.addEventListener('click', () => {

        if(isCelcius){
            isCelcius = false;
        }else{
            isCelcius = true;
        }
        return tog(isCelcius)
    })
   
}
document.addEventListener('DOMContentLoaded', weatherAppSimple);