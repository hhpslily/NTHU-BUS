var sound = new Audio("https://freesound.org/data/previews/316/316847_4939433-lq.mp3");
var alarm;
var index;
var time;

sound.loop = true;

function  setAlarm() {
    jQuery('.reminder').fadeTo(200, 1);  
}

function cancelReminder() {
    document.getElementsByClassName('selectStop')[0].selectedIndex = 0;
    document.getElementsByClassName('selectTime')[0].selectedIndex = 0;
    jQuery('.reminder').fadeOut(200);    
}

function setReminder() {
    jQuery('.reminder').fadeOut(200);
    index = jQuery('.selectStop')[0].selectedIndex;
    alarm = jQuery('.selectTime').val();
    countDown();    
}

function countDown() {
    console.log(time);
    time = tmp[index-1].split(" ")[0];
    if (time == alarm) {
        sound.play();
        jQuery('.arrive').fadeTo(200, 1); 
        return;
    }
    setTimeout(countDown, 1000);
}

function pauseSound() {
    sound.pause();
    jQuery('.arrive').fadeOut(200); 
}