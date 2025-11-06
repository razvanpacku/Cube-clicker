function simpleHash(str, seed = 0){
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function randomSalt(){
    return simpleHash(toString(Date.now()), Date.now());
}

function tryParseJSONObject (jsonString){
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }

    return false;
};

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function getMatrixFromTransform(element){
    let st = window.getComputedStyle(element, null);
    let tr = st.getPropertyValue("transform");
    let values = tr.split('(')[1];
    values = values.split(')')[0];
    values = values.split(',');
    values = values.map(Number);
    let matrix = [];
    for(let i = 0;i<3;i++){
        for(let j = 0; j<3;j++){
            matrix.push(values[i*4+j])
        }
    }
    return matrix;
}

function mulMatrix3(A, B){
    C = [];
    for(let i = 0; i<3; i++){
        for(let j = 0; j<3; j++){
            let mul = 0;
            for(let k = 0; k<3; k++){
                mul += A[i*3+k]*B[k*3+j];
            }
            C.push(mul);
        } 
    }
    return C;
}

function mulMatrixVector3(A,v){
    w = [];
    for(let i = 0; i<3; i++){
        let mul = 0;
        for(let j = 0; j<3; j++){
            mul += A[i*3+j]*v[j];
        } 
        w.push(mul);
    }
    return w;
}

function vectorLength3(v){
    let sum = 0;
    for(let i = 0;i<3;i++){
        sum+=v[i]*v[i];
    }
    return Math.sqrt(sum);
}
function dotProduct3(v, w){
    let sum = 0;
    for(let i = 0;i<3;i++){
        sum+=v[i]*w[i];
    }
    return sum;
}

function angleVector3(v,w){
    return dotProduct3(v,w)/(vectorLength3(v)*vectorLength3(w));
}

function clamp(value, min, max){
    if(value<min) return min;
    else if(value>max) return max;
    else return value;
}

function niceRound(num){
    if(num<99.99) return num.toFixed(1);
    else return num.toFixed(2);
}

function currentPage(){
    return window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
}

function currentPageMinusQuery() {
    return /.+?(?=\?)/.exec(currentPage())[0];
}

function getLoginType(){
    return /\?type\=(.*)/.exec(currentPage())[1];
}

function detectOverflow(element){
    var curOverflow = element.style.overflow;

   if ( !curOverflow || curOverflow === "visible" )
      element.style.overflow = "hidden";

   var isOverflowing = element.clientWidth < element.scrollWidth 
      || element.clientHeight < element.scrollHeight;

   element.style.overflow = curOverflow;

   return isOverflowing;
}

var buyablesNumber = 0;

class Buyable{
    constructor(name, production, initalValue, image){
        this.name = name;
        this.production = production;
        this.initalValue = initalValue;
        this.image = image
        this.id = buyablesNumber;
        buyablesNumber++;
    }
}

var upgradesNumber = 0;

class Upgrade{
    constructor(name, description, price, image, buyFunction, unlockFunction){
        this.name = name;
        this.description = description;
        this.price = price;
        this.image = image;
        this.buyFunction = buyFunction;
        this.unlockFunction = unlockFunction;
        this.id = upgradesNumber;
        upgradesNumber++;
    }
}

var achievementsNumber = 0

class Achievement{
    constructor(name, description, image, unlockFunction){
        this.name = name;
        this.description = description;
        this.image = image;
        this.unlockFunction = unlockFunction;
        this.id = achievementsNumber;
        achievementsNumber++;
    }
}

window.onload = function(){

    buyables = [];

    function addBuyable(buyable){
        buyables.push(buyable);
    }

    addBuyable(new Buyable("Cubelet", 0.1, 1, [0,0]));

    upgrades = [];
    upgradesById = {};

    function addUpgrade(upgrade){
        upgrades.push(upgrade);
        upgradesById[upgrade.id] = upgrade;
    }

    //registiring upgrades

    upgradesNumber = 0;

    addUpgrade(new Upgrade("Cube splinter", "Reduces the price of cubelets by 10%.", 100, [0,0], function(Save) {
        Save.buyablePriceReduction[buyables[0].id] *= 0.9;
    }, function(Save) {
        if(Save.amountOfBuyables[0] >= 10) return true;
        else return false;
    }));

    achievements = [];
    achievementsById = {};

    function addAchievement(achievement){
        achievements.push(achievement);
        achievementsById[achievement.id] = achievement;
    }

    achievementsNumber = 0;

    addAchievement(new Achievement("First cube", "Have 1 cube total.", [0,0], function(Save) {
        if(Save.numberOfCubes > 0) return true;
        else return false;
    }));

    achievementsNumber = 100;

    addAchievement(new Achievement("Steady supply", "Get 1 cube per second", [0,0], function(Save) {
        if(Save.deltaCube > 1 - 0.01) return true;
        else return false;
    }));

    achievementsNumber = 10000;

    addAchievement(new Achievement("Necessary requirement", "Click on the background", [0,15], function(Save) {
        return false;
    }));

    console.log(achievements);

    let localSave = localStorage.getItem("localSave");
    let Save = null;

    function newSave(){
        Save = new Object();
        Save.amountOfBuyables = new Object();
        for(buyable in buyables){
            Save.amountOfBuyables[buyable]=0;
        }
        Save.buyablePriceReduction = {};
        for(buyable of buyables){
            Save.buyablePriceReduction[buyable.id] = 1;
        }

        Save.upgradesSituation = {};
        for(upgrade of upgrades){
            Save.upgradesSituation[upgrade.id] = 0;
        }

        Save.achievementsSituation = {};
        for(achievement of achievements){
            Save.achievementsSituation[achievement.id] = 0;
        }

        Save.numberOfCubes = 0;
        Save.deltaCube = 0;
        Save.totalCubes = 0;
        Save.fractional = 0; 

        Save.volume = 1;
    }

    function refreshBuyables(){
        let buyablesList = document.querySelector("#buyablesList").children;
        for(const buyable of buyables){
            let container = buyablesList.item(buyable.id);
            let reduction = Save.buyablePriceReduction[buyable.id];
            container.getElementsByClassName("buyableInfo")[0].innerHTML = `<h1>${buyable.name}</h1> ${Math.floor(buyable.initalValue*reduction*Math.pow(Save.amountOfBuyables[container.getAttribute("buyableIndex")]+1, 1.5))} cubes <br> ${buyable.production}/s - ${niceRound(buyable.production*Save.amountOfBuyables[container.getAttribute("buyableIndex")])}/s <br> ${Save.amountOfBuyables[container.getAttribute("buyableIndex")]} bought`;
        }
    }

    //add new keys to Save in case of updates
    function updateSave(){
        for(buyable in buyables){
            if(!(Save.amountOfBuyables.hasOwnProperty(buyable))){
                Save.amountOfBuyables[buyable]=0;
            }
        }
        if(!(Save.hasOwnProperty("volume"))){
            Save.volume = 1;
        }
        if(!('upgradesSituation' in Save)){
            Save.upgradesSituation = {};
        }
        for(upgrade of upgrades){
            if(!(upgrade.id in Save.upgradesSituation)){
                Save.upgradesSituation[upgrade.id] = 0;
            }
        }
        if(!('buyablePriceReduction' in Save)){
            Save.buyablePriceReduction = {};
        }
        for(buyable of buyables){
            if(!(buyable.id in Save.buyablePriceReduction)){
                Save.buyablePriceReduction[buyable.id] = 1;
            }
        }
        if(!('achievementsSituation' in Save)){
            Save.achievementsSituation = {};
        }
        for(achievement of achievements){
            if(!(achievement.id in Save.achievementsSituation)){
                Save.achievementsSituation[achievement.id] = 0;
            }
        }
    }

    function authLogin(){
        if(readCookie('auth') !== null && currentPage() == "index"){
            var auth = readCookie('auth');
            var request = fetch("/auth?auth=" + auth);
            request.then((res) => {
                return res.text();
            }).then((text) => {
                var data = JSON.parse(text);
                if(data.res != "none"){
                    Save = JSON.parse(data.res);
                    updateSave();
                    if(currentPage() == "index") refreshBuyables();
                    localStorage.setItem("localSave", JSON.stringify(Save));
                    return true;
                }
                else return false;
            });
        }
        else return false;
    }

    function logout(){
        if(readCookie('auth') !== null && currentPage() == "index"){
            var auth = readCookie('auth');
            var request = fetch(`/logout?auth=${auth}`);
            request.then((res) => {
                return res.text();
            }).then((text) => {
                var data = JSON.parse(text);
                if(data.res != "none"){
                    return true;
                }
                else return false;
            });
        }
        else return false;
    }

    function hardSave(){
        if(readCookie('auth') !== null && currentPage() == "index"){
            var auth = readCookie('auth');
            var request = fetch(`/save?auth=${auth}&save=${JSON.stringify(Save)}`);
            request.then((res) => {
                return res.text();
            }).then((text) => {
                var data = JSON.parse(text);
                if(data.res != "none"){
                    return true;
                }
                else return false;
            });
        }
        else return false;
    }

    function fullSave(){
        hardSave();
        localStorage.setItem("localSave", JSON.stringify(Save));
    }

    if(!authLogin() && localSave){
        Save = JSON.parse(localSave);
    }
    else{
        newSave();
    }

    updateSave();

    let autoSave = setInterval(function() {
        localStorage.setItem("localSave", JSON.stringify(Save));
    }, 60000);

    let hardAutoSave = null;

    if(readCookie('auth') !== null && currentPage() == "index"){
        hardAutoSave = setInterval(hardSave, 300000);
    }

    document.addEventListener("keydown", (e) => {
        if(e.key === "s" && e.ctrlKey){
            e.preventDefault();
            hardSave();
            localStorage.setItem("localSave", JSON.stringify(Save));
        }
    });

    function checkUnlocks(){
        for(upgrade of upgrades){
            if(Save.upgradesSituation[upgrade.id] == 0 && upgrade.unlockFunction(Save)){
                Save.upgradesSituation[upgrade.id] = 1;
            }
        }
        for(achievement of achievements){
            if(Save.achievementsSituation[achievement.id] == 0 && achievement.unlockFunction(Save)){
                Save.achievementsSituation[achievement.id] = 1;
            }
        }
    }

    if(currentPage() == "index"){

        //css which doesn't wanna work so it's done in js
        {
            {
                let menu = document.querySelector("#menu");
                let rect = menu.getBoundingClientRect();
                menu.style.height= `${window.innerHeight-rect.y}px`;
                window.addEventListener("resize", function() {
                    let rect = menu.getBoundingClientRect();
                    menu.style.height= `${window.innerHeight-rect.y}px`;
                });
            }
            {
                submenus = document.getElementsByClassName("submenu");
                var maxi = 0;
                for(var i = 0; i<submenus.length;i++){
                    if(maxi<submenus[i].children.length) maxi = submenus[i].children.length;
                    for(var j=0; j<submenus[i].children.length; j++) submenus[i].children[j].classList.add(`-submenu-element-${j}`);
                }
                var css="";
                var styleSheet = document.createElement("style")
                for(var i = 0; i<maxi;i++){
                    css+=`.submenu_container:hover > ul.submenu .-submenu-element-${i} {
                        transform: scaleY(0%);
                        animation: dropdown 0.2s ${i*0.05}s forwards;
                        transform-origin: top center;
                    }\n`;
                }
                styleSheet.innerText=css;
                document.head.appendChild(styleSheet);
            }
        }

        //display current available buyables
        let buyablesList = document.querySelector("#buyablesList");
        i = 0;
        for(const buyable of buyables){
            let container = document.createElement("figure");
            container.setAttribute("buyableIndex", i);
            container.innerHTML=`
                                <img src="images/blank.png" style=\"width: 64px; height: 64px; background: url(images/spritesheet.png) ${-buyable.image[0]*64}px ${-buyable.image[1]*64}px\"></img>
                                <figcaption class="buyableInfo">
                                    <h1>${buyable.name}</h1> ${buyable.initalValue} cubes <br> ${buyable.production}/s <br> ${Save.amountOfBuyables[container.getAttribute("buyableIndex")]} bought 
                                </figcaption>
                                `;
            if(Save.amountOfBuyables[container.getAttribute("buyableIndex")]>0){
                let reduction = Save.buyablePriceReduction[buyable.id];
                container.getElementsByClassName("buyableInfo")[0].innerHTML = `<h1>${buyable.name}</h1> ${Math.floor(buyable.initalValue*reduction*Math.pow(Save.amountOfBuyables[container.getAttribute("buyableIndex")]+1, 1.5))} cubes <br> ${buyable.production}/s - ${niceRound(buyable.production*Save.amountOfBuyables[container.getAttribute("buyableIndex")])}/s <br> ${Save.amountOfBuyables[container.getAttribute("buyableIndex")]} bought`;
            }
            container.setAttribute("mouseoverFix", 0);
            container.addEventListener("mousedown", function() {
                container.setAttribute("mouseoverFix", 1);
                container.style.border = "inset 4px #dddddd";
                container.style.padding = "4px 0px 0px 4px";
            });
            container.addEventListener("mouseup", function() {
                if(container.getAttribute("mouseoverFix")==0){
                    container.style.border = "outset 4px #aaaaaa";
                }
                else{
                    container.style.border = "outset 4px #eeeeee";
                }
                container.style.padding = "0px 4px 4px 0px";
            });
            container.addEventListener("mouseenter", function() {
                container.setAttribute("mouseoverFix", 1);
                container.style.border = "outset 4px #eeeeee";
            });
            container.addEventListener("mouseleave", function() {
                container.setAttribute("mouseoverFix", 0);
                container.style.border = "outset 4px #aaaaaa";
                container.style.padding = "0px 4px 4px 0px";
            });

            container.addEventListener("click", function() {
                goodPlay(clickAudio);
                let reduction = Save.buyablePriceReduction[buyable.id];
                let price = Math.floor(buyable.initalValue*reduction*Math.pow(Save.amountOfBuyables[container.getAttribute("buyableIndex")]+1, 1.5));
                if(Save.numberOfCubes >= price){
                    Save.amountOfBuyables[container.getAttribute("buyableIndex")]++;
                    Save.deltaCube += buyable.production;
                    Save.numberOfCubes -= price;

                    container.getElementsByClassName("buyableInfo")[0].innerHTML = `<h1>${buyable.name}</h1> ${Math.floor(buyable.initalValue*reduction*Math.pow(Save.amountOfBuyables[container.getAttribute("buyableIndex")]+1, 1.5))} cubes <br> ${buyable.production}/s - ${niceRound(buyable.production*Save.amountOfBuyables[container.getAttribute("buyableIndex")])}/s <br> ${Save.amountOfBuyables[container.getAttribute("buyableIndex")]} bought`;
                }
            });

            buyablesList.appendChild(container);
            i++;
        }

        //regularly check if upgrades or achievements are unlocked;

        checkInterval = setInterval( checkUnlocks, 200);

        //hover div
        hovering = 0;

        //display current available upgrades
        let upgradesList = document.querySelector(".upgradeGrid");
        updateUpgrades = setInterval(function () {
            upgradesList.innerHTML = "";
            for(const upgrade of upgrades){
                if(Save.upgradesSituation[upgrade.id] == 1){
                    let container = document.createElement("div");
                    container.classList.add("upgradeCellContainer");
                    container.innerHTML = `
                    <div class="upgradeCell" style="width: 40px; height: 40px; background: url(images/upgrades.png) ${-upgrade.image[0]*40}px ${-upgrade.image[1]*40}px"></div>
                    `;

                    container.addEventListener("click", function() {
                        goodPlay(clickAudio);

                        let price = upgrade.price;
                        if(Save.numberOfCubes>=price){
                            Save.numberOfCubes -= price;
                            Save.upgradesSituation[upgrade.id] = 2;
                            upgrade.buyFunction(Save);
                            container.remove();
                            refreshBuyables();
                        }
                    });

                    container.addEventListener("mouseenter", function() {
                        let infoDiv = document.createElement("div");
                        infoDiv.classList.add("infoDiv");
                        infoDiv.innerHTML = `${upgrade.name} <br><br> ${upgrade.description}<br><br> ${upgrade.price} cubes`;
                        
                        hovering = 1;

                        document.body.appendChild(infoDiv);
                        infoDiv.style.top=`${Math.floor((window.innerHeight-parseInt(getComputedStyle(infoDiv).height))*9/10)}px`;
                        infoDiv.style.left=`${Math.floor((window.innerWidth-parseInt(getComputedStyle(infoDiv).width))/2)}px`;
                    });
                    container.addEventListener("mouseleave", function() {
                        hovering = 0;
                    });


                    upgradesList.appendChild(container);
                }
            }
            if(hovering == 0){
                let infos = document.querySelectorAll(".infoDiv");
                for(doc of infos) doc.remove();
            }
        },200);

        let cube = document.querySelector(".cube");

        let cubeSpinning = false;
        let cubePosition = 0;

        let numberDiv = document.querySelector("#totalNumber");
        let deltaNumberDiv = document.querySelector("#numberPerSecond");

        setInterval(() =>{
            numberDiv.innerHTML = Save.numberOfCubes.toLocaleString("en");
            deltaNumberDiv.innerHTML = `Cubes per second: ${niceRound(Save.deltaCube)}`;
        },1);

        setInterval(() =>{
            Save.fractional += Save.deltaCube/100;
            if(Save.fractional > 0.99){
                Save.numberOfCubes += Math.floor(Save.fractional);
                Save.totalCubes += Math.floor(Save.fractional);
                Save.fractional -= Math.floor(Save.fractional);
            }
        },10);

        dict=[];

        let front = document.querySelector(".cube__face--front");
        let back = document.querySelector(".cube__face--back");
        let right = document.querySelector(".cube__face--right");
        let left = document.querySelector(".cube__face--left");
        let top = document.querySelector(".cube__face--top");
        let bottom = document.querySelector(".cube__face--bottom");

        dict[0]=[0,0,1];
        dict[1]=[0,0,-1];
        dict[2]=[0,1,0];
        dict[3]=[0,-1,0];
        dict[4]=[-1,0,0];
        dict[5]=[1,0,0];

        function updateShade(){
            for(let i=0; i<cube.children.length; i++){
                let face = cube.children[i];
                if(face.getAttribute("clicked") != "yes"){
                    let value = angleVector3([0,0,1], mulMatrixVector3(getMatrixFromTransform(cube), dict[i]));
                    value = clamp(value*255, 0, 255);
                    face.style.backgroundColor = `rgb(${value*3/2-255}, ${value*3/2}, ${value*3/2-255})`;
                }
            }
        }
        updateShade();

        cube.addEventListener( "click", function(e) {
            Cube = e.currentTarget;
            if(e.target != e.currentTarget){
                cubeFace = e.target;
                cubeFace.style.backgroundColor = "#ffffff";
                cubeFace.setAttribute("clicked", "yes");
                setTimeout(() => {
                    cubeFace.setAttribute("clicked", "no");
                    updateShade();
                }, 50);
            }
            if(cubeSpinning == false){
                cubeSpinning = true;
                cubePosition = (cubePosition+1)%2;
                if(cubePosition == 1){
                    Cube.classList.remove("idle");
                    Cube.classList.add("spin1");
                }
                else{
                    Cube.classList.remove("rotated");
                    Cube.classList.add("spin2"); 
                }

                let shade = setInterval(updateShade, 5);
                setTimeout(() => {
                    if(cubePosition == 1){
                        Cube.classList.remove("spin1");
                        Cube.classList.add("rotated");
                    }
                    else{
                        Cube.classList.remove("spin2");
                        Cube.classList.add("idle"); 
                    }
                    cubeSpinning = false;
                    clearInterval(shade);
                }, 500);

                Save.numberOfCubes++;
                Save.totalCubes++;
            }
        });

        //visual thing for stopPropagation

        cubeBackround =  document.getElementById("cubeSection");
        cubeBackgroundAnimation = 100;
        cubeBackround.setAttribute("animated", "no");

        cubeBackround.addEventListener("click", function(e) {
            e.stopPropagation();
            if(e.target != e.currentTarget) return;
            Save.achievementsSituation[10000] = 1;
            if(cubeBackround.getAttribute("animated") == "no"){
                cubeBackround.setAttribute("animated", "yes");
                cubeBackround.style.animation = `easter_egg_1 ${cubeBackgroundAnimation/1000}s forwards`;
                setTimeout(() => {
                    cubeBackround.style.animation = `easter_egg_2 ${cubeBackgroundAnimation/1000}s forwards`;
                    setTimeout(() => {
                        cubeBackround.setAttribute("animated", "no");
                    }, cubeBackgroundAnimation);
                }, cubeBackgroundAnimation);
            }
        });

        //audio

        let clickAudio = new Audio("audio/punchy-taps-ui-5-183901.mp3");
        let audios = [clickAudio];
        function goodPlay(audioElement){
            if(audioElement.paused){
                audioElement.play();
            }
            else{
                audioElement.currentTime = 0;
            }
        }

        function updateVolume(){
            for(audioElement of audios){
                audioElement.volume = Save.volume;
            }
        }

        updateVolume();

        let menuUpdate = "null";

        document.getElementById("menu").addEventListener("updateMenu", (e) => {
            if(e.detail.name == "info"){
                document.getElementById("menu").innerHTML = `
                <button id="exitButton"></button>
                <h1>Info</h1>
                <h2>About</h2>
                <div id="menuContent">
                    Cube Clicker is an incremental game inspired by Cookie Cliker.<br>
                    Made by razvanpacku.
                </div>
                `;
            }
            else if(e.detail.name == "general"){
                document.getElementById("menu").innerHTML = `
                <button id="exitButton"></button>
                <h1>General</h1>
                <div id="menuContent">
                    <mark>Current cubes:</mark> ${Save.numberOfCubes}<br>
                    <mark>Total cubes clicked:</mark> ${Save.totalCubes}<br>
                    <mark>Cubes per second:</mark> ${niceRound(Save.deltaCube)} <br>
                    <mark>Most bought buyable:</mark>  ${buyables[Object.keys(Save.amountOfBuyables).reduce(function(a, b){ return obj[a] > obj[b] ? a : b })].name}
                </div>
                `;
                menuUpdate = setInterval(function() {
                document.getElementById("menu").innerHTML = `
                <button id="exitButton"></button>
                <h1>General</h1>
                <div id="menuContent">
                    <mark>Current cubes:</mark> ${Save.numberOfCubes}<br>
                    <mark>Total cubes clicked:</mark> ${Save.totalCubes}<br>
                    <mark>Cubes per second:</mark> ${niceRound(Save.deltaCube)} <br>
                    <mark>Most bought buyable:</mark>  ${buyables[Object.keys(Save.amountOfBuyables).reduce(function(a, b){ return obj[a] > obj[b] ? a : b })].name}
                </div>
                `;
                }, 10000);
            }
            else if(e.detail.name == "unlocks"){
                document.getElementById("menu").innerHTML = `
                <button id="exitButton"></button>
                <h1>Unlocks</h1>
                <div id="menuContent">
                    <div id="columnGrid">
                        <div class="columnGridContainer" id="upgr">
                            <div class="unlockGrid" id="upgradesList">
                            </div>
                        </div>
                        <div class="columnGridContainer" id="achv">
                            <div class="unlockGrid" id="achievementsList">
                            </div>
                        </div>
                    </div>
                </div>
                `;

                let upgradesList2 = document.getElementById("upgradesList");
                let achievementsList = document.getElementById("achievementsList");
                let checkList = setInterval(function(){
                    upgradesList2.innerHTML = "";
                    achievementsList.innerHTML = "";
                    for(const upgrade of upgrades){
                        let container = document.createElement("div");
                        container.classList.add("upgradeCellContainer");
                        if(Save.upgradesSituation[upgrade.id] == 2){
                            container.innerHTML = `
                            <div class="upgradeCell" style="width: 40px; height: 40px; background: url(images/upgrades.png) ${-upgrade.image[0]*40}px ${-upgrade.image[1]*40}px"></div>
                            `;
                        }
                        else{
                            container.innerHTML = `
                            <div class="upgradeCell" style="width: 40px; height: 40px; background: url(images/questionMark.png)"></div>
                            `;
                        }
                        container.addEventListener("mouseenter", function() {
                            let infoDiv = document.createElement("div");
                            infoDiv.classList.add("infoDiv");
                            if(Save.upgradesSituation[upgrade.id] == 2){
                                infoDiv.innerHTML = `${upgrade.name} <br><br> ${upgrade.description}`;
                            }
                            else{
                                infoDiv.innerHTML = `??? <br><br> ???`;
                            }

                            hovering = 1;
                            
                            document.body.appendChild(infoDiv);
                            infoDiv.style.top=`${Math.floor((window.innerHeight-parseInt(getComputedStyle(infoDiv).height))*9/10)}px`;
                            infoDiv.style.left=`${Math.floor((window.innerWidth-parseInt(getComputedStyle(infoDiv).width))/2)}px`;
                        });
                        container.addEventListener("mouseleave", function() {
                            hovering = 0;
                        });


                        upgradesList2.appendChild(container);
                    }
                    for(const achievement of achievements){
                        let container = document.createElement("div");
                        container.classList.add("upgradeCellContainer");
                        if(Save.achievementsSituation[achievement.id] == 1){
                            container.innerHTML = `
                            <div class="upgradeCell" style="width: 40px; height: 40px; background: url(images/achievements.png) ${-achievement.image[0]*40}px ${-achievement.image[1]*40}px"></div>
                            `;
                        }
                        else{
                            container.innerHTML = `
                            <div class="upgradeCell" style="width: 40px; height: 40px; background: url(images/questionMark.png)"></div>
                            `;
                        }
                        container.addEventListener("mouseenter", function() {
                            let infoDiv = document.createElement("div");
                            infoDiv.classList.add("infoDiv");
                            if(Save.achievementsSituation[achievement.id] == 1){
                                infoDiv.innerHTML = `${achievement.name} <br><br> ${achievement.description}`;
                            }
                            else{
                                infoDiv.innerHTML = `??? <br><br> ???`;
                            }

                            hovering = 1;
                            
                            document.body.appendChild(infoDiv);
                            infoDiv.style.top=`${Math.floor((window.innerHeight-parseInt(getComputedStyle(infoDiv).height))*9/10)}px`;
                            infoDiv.style.left=`${Math.floor((window.innerWidth-parseInt(getComputedStyle(infoDiv).width))/2)}px`;
                        });
                        container.addEventListener("mouseleave", function() {
                            hovering = 0;
                        });


                        achievementsList.appendChild(container);
                    }
                    if(hovering == 0){
                        let infos = document.querySelectorAll(".infoDiv");
                        for(doc of infos) doc.remove();
                    }
                } ,200);
            }
            else if(e.detail.name == "options"){
                document.getElementById("menu").innerHTML = `
                <button id="exitButton"></button>
                <h1>Options</h1>
                <h2>Savedata</h2>
                <div id="menuContent">
                    <div class="optionContainer">
                        <button class="optionButton" id="saveButton">Save</button>
                        <mark> (Game autosaves every 60 seconds. CTRL+S shortcut)</mark>
                    </div>
                    <div class="optionContainer">
                        <button class="optionButton sensitiveOption" id="wipeSaveButton"">Wipe Save</button>
                        <mark> (Delete all progress) </mark>
                    </div>
                    <div class="optionContainer">
                        <button class="optionButton sensitiveOption" id="newSaveButton"">New Save</button>
                        <mark> (Logs you out and then wipes the local save stored in the browser) </mark>
                    </div>
                    <div class="optionContainer">
                        <input type="range" min="0" max="100" value="${Save.volume*100}" class="optionSlider" id="volumeSlider">
                        <mark> (Volume) </mark>
                    </div>
                    <div class="optionContainer">
                    ${((readCookie('auth') === null) ? "<button class=\"optionButton\" id=\"logIn\"> Log in </button>" : "<button class=\"optionButton\" id=\"logOut\"> Log out </button>")}
                    ${((readCookie('auth') === null) ? "<button class=\"optionButton\" id=\"signUp\"> Sign up </button>" : "")}
                    </div>
                </div>
                `;
                document.getElementById("saveButton").addEventListener("click", function() {
                    localStorage.setItem("localSave", JSON.stringify(Save));
                    if(readCookie('auth') !== null){
                        hardSave();
                    }
                });
                document.getElementById("wipeSaveButton").addEventListener("click", function() {
                    newSave();
                    localStorage.setItem("localSave", JSON.stringify(Save));
                    if(readCookie('auth') !== null){
                        hardSave();
                    }
                    location.reload();
                });
                document.getElementById("newSaveButton").addEventListener("click", function() {
                    logout();
                    document.cookie = "auth= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
                    newSave();
                    localStorage.setItem("localSave", JSON.stringify(Save));
                    location.reload();
                });
                document.getElementById("volumeSlider").addEventListener("change", function () {
                    Save.volume = document.getElementById("volumeSlider").value / 100;
                    updateVolume();
                });

                let logIn = document.getElementById("logIn");
                let logOut = document.getElementById("logOut");
                let signUp = document.getElementById("signUp");

                if(logIn !== null){
                    logIn.addEventListener("click", function(){
                        fullSave();
                        window.location.assign("login?type=login");
                    });
                }
                if(logOut !== null){
                    logOut.addEventListener("click", function(){
                        fullSave();
                        logout();
                        document.cookie = "auth= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
                        location.reload();
                    });
                }
                if(signUp !== null){
                    signUp.addEventListener("click", function(){
                        fullSave();
                        window.location.assign("login?type=signup");
                    });
                }
            }
            else if(e.detail.name == "nothing"){
                if(menuUpdate != "null"){
                    clearInterval(menuUpdate);
                    menuUpdate = "null";
                }
                document.getElementById("menu").innerHTML = "";
            }
            if(e.detail.name != "nothing"){
                document.getElementById("exitButton").addEventListener("click", function () {
                    document.getElementById("menu").dispatchEvent(
                        new CustomEvent("updateMenu", {
                            detail: {
                                name: "nothing",
                            },
                        })
                    );
                });
            }
        });

        document.getElementById("infoButton").addEventListener("click", function () {
            document.getElementById("menu").dispatchEvent(
                new CustomEvent("updateMenu", {
                    detail: {
                        name: "info",
                    },
                })
            );
        });
        document.getElementById("optionsButton").addEventListener("click", function () {
            document.getElementById("menu").dispatchEvent(
                new CustomEvent("updateMenu", {
                    detail: {
                        name: "options",
                    },
                })
            );
        });
        document.getElementById("generalButton").addEventListener("click", function () {
            document.getElementById("menu").dispatchEvent(
                new CustomEvent("updateMenu", {
                    detail: {
                        name: "general",
                    },
                })
            );
        });
        document.getElementById("unlocksButton").addEventListener("click", function () {
            document.getElementById("menu").dispatchEvent(
                new CustomEvent("updateMenu", {
                    detail: {
                        name: "unlocks",
                    },
                })
            );
        });
        document.getElementById("changelogButton").addEventListener("click", function () {
            fullSave();
            window.location.assign("changelog");
        });


        //tips
        tipMessages = ["Buy buyables to increase cps.", "Click the big cube to gain cubes."];
        tipDiv = document.getElementById("tips");
        tipDiv.setAttribute("overflowed", 0);
        function updateMessage(){
            dateRandom = Math.floor(Math.random()*10);
            if(dateRandom == 0){
                today = new Date();
                dd = String(today.getDate()).padStart(2, '0');
                mm = String(today.getMonth() + 1).padStart(2, '0');
                yyyy = today.getFullYear();
                tipDiv.innerHTML = `Today is ${dd}/${mm}/${yyyy}.`;
            }
            else tipDiv.innerHTML = tipMessages[Math.floor(Math.random()*tipMessages.length)];

        }
        editMessages = setInterval(updateMessage, 60000);
        tipDiv.addEventListener("click", updateMessage);
        updateMessage();
        window.addEventListener("resize", function() {
            if(document.documentElement.clientWidth < 1000){
                  tipDiv.innerHTML = "Help!";
                  if(tipDiv.getAttribute("overflowed") == 0){
                      clearInterval(editMessages);
                      tipDiv.removeEventListener("click", updateMessage);
                     tipDiv.setAttribute("overflowed", 1);
                }
            }
            else{
                  if(tipDiv.getAttribute("overflowed") == 1){
                    updateMessage();
                     editMessages = setInterval(updateMessage, 60000);
                    tipDiv.addEventListener("click", updateMessage);
                    tipDiv.setAttribute("overflowed", 0);
                 }
            }
        });
    }
    else if(currentPage() == "changelog"){
        
        //css which doesn't wanna work so it's done in js
        {
            {
                let menu = document.querySelector("#changelogMenu");
                let rect = menu.getBoundingClientRect();
                menu.style.height= `${window.innerHeight-rect.y}px`;
                window.addEventListener("resize", function() {
                    let rect = menu.getBoundingClientRect();
                    menu.style.height= `${window.innerHeight-rect.y}px`;
                });
            }
        }
    }
    else if(currentPageMinusQuery() == "login"){
         //css which doesn't wanna work so it's done in js
         {
            {
                let menu = document.querySelector("#loginMenu");
                let rect = menu.getBoundingClientRect();
                menu.style.height= `${window.innerHeight-rect.y}px`;
                window.addEventListener("resize", function() {
                    let rect = menu.getBoundingClientRect();
                    menu.style.height= `${window.innerHeight-rect.y}px`;
                });
            }
        }

        if(getLoginType() == "signup"){
            document.getElementById("loginTitle").innerHTML = "Sign up";
        }
        else if(getLoginType() == "login"){
            document.getElementById("loginTitle").innerHTML = "Log in";
        }

        let form = document.getElementById("mainForm");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const params = new URLSearchParams(formData);
            formJSON = JSON.parse(JSON.stringify(Object.fromEntries(formData)));

            let hashedParams = null;

            //data validation
            if(getLoginType() == "signup"){
                if(!(/^[A-Za-z][A-Za-z0-9_]{0,29}$/.test(formJSON.username))){
                    document.getElementById("loginInfo").innerHTML = "Username must start with a letter, must contain only letters and numbers, and must have at most 30 characters.";
                    return;
                }
                else if(!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formJSON.password))){
                    document.getElementById("loginInfo").innerHTML = "Password must have minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.";
                    return;
                }
                else if(formJSON.password != formJSON.passwordConfirm){
                    document.getElementById("loginInfo").innerHTML = "Passwords must match.";
                    return;
                }
                    //hashing and salting
                formJSON.passwordSalt = randomSalt();
                formJSON.passwordHash = simpleHash(formJSON.password + formJSON.passwordSalt);
                delete formJSON["password"];
                delete formJSON["passwordConfirm"];
                formJSON.save = JSON.stringify(Save);

                hashedParams = new URLSearchParams(formJSON);
            }
            else if(getLoginType() == "login"){
                if (formJSON.overwrite == "yes"){
                    formJSON.save = JSON.stringify(Save);
                }
                hashedParams = new URLSearchParams(formJSON);
            }
            var request = fetch("/form?" + `type=${getLoginType()}&` + hashedParams.toString());
            request.then((res) => {
                return res.text();
            }).then((text) => {
                if(getLoginType() == "login"){
                    var data = JSON.parse(text);
                    document.getElementById("loginInfo").innerHTML = data.res;
                    if(tryParseJSONObject(data.res)){
                        let obj = JSON.parse(data.res);
                        document.getElementById("loginInfo").innerHTML = "";
                        document.cookie=`auth=${obj.auth};expires=${new Date(new Date().getTime()+60*60*1000*24).toGMTString()};path=/`;
                        setTimeout(() => {
                            window.location.assign("index");
                        } , 500)
                    }
                }
                else if(getLoginType() == "signup"){
                    var data = JSON.parse(text);
                    if(data.res != "ok"){
                        document.getElementById("loginInfo").innerHTML = data.res;
                    }
                    else{
                        setTimeout(() => {
                            window.location.assign("login?type=login");
                        } , 500)
                    }
                }
            });
        });
    }
}