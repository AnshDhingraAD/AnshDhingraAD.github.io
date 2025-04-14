console.log('its working');
let songs;
let currFolder;
let currentaudio = new Audio();

async function fetchsongs(folder) {
    currFolder = folder;

    let a = await fetch(`/public/songs/${folder}/info.json`);


    let response = await a.json();
    console.log(response); 


    songs = [];
    let songList = response.songs;

    for (let index = 0; index < songList.length; index++) {
        const song = songList[index];
        songs.push(song.href);
        console.log("Songs array:", songs);

    }


    let songsul = document.querySelector('.songslist').getElementsByTagName("ul")[0];
    songsul.innerHTML = "";

    for (const song of songs) {
        songsul.innerHTML += `<li><a href="${song}">
            <img src="music.svg" alt="">
            <div class="songinfo">
                <div class="songname">${song.split('/public/songs/')[1].split('/')[1].replaceAll('%20', ' ').split('.mp3')[0].split('-')[0]}</div>
                <div class="artistname">${song.split('/public/songs/')[1].replaceAll('%20', ' ').split('.mp3')[0].split('-')[1]}</div>
            </div>
            <div class="playnow">Play Now
                <img src="playbar-play.svg" alt="">
            </div>  
        </a></li>`;
    }


    document.querySelectorAll(".songslist li a").forEach(a => {
        a.addEventListener('click', element => {
            element.preventDefault();
            let song = a.href;
            currentaudio.src = song;
            currentaudio.play();
            play.src = "pause.svg";
            document.querySelector('.songnaam').innerHTML = currentaudio.src.split('/public/songs/')[1].split('/')[1].replaceAll('%20', ' ').split('.mp3')[0].split('-')[0] + "<br>" + currentaudio.src.split('/public/songs/')[1].replaceAll('%20', ' ').split('.mp3')[0].split('-')[1];
        });
    });
}

function formatTime(seconds) {
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    if (isNaN(secs)) return "00:00";
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

async function displayalbum() {
    let a = await fetch("public/songs/albums.json");
    let response = await a.json();

    console.log(response); 
    let folders = response.albums;

 
    console.log(folders);
    console.log(Array.isArray(folders)); 

    if (!Array.isArray(folders)) {
        console.error("The 'albums' key is not an array in albums.json");
        return;
    }

    let div = document.createElement('div');
    let cardcontainer = document.querySelector('.card-container');
    div.innerHTML = response;

 
    for (let index = 0; index < folders.length; index++) {
        const folder = folders[index];

        let a = await fetch(`/public/songs/${folder}/info.json`);
        let albumData = await a.json();

        cardcontainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <img src="/public/songs/${folder}/cover.jpg" alt="">
                <div class="play">
                    <img src="play.svg" alt="">
                </div>
                <h2>${albumData.title}</h2>
                <p>${albumData.description}</p>
            </div>`;
    }

   
    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async item => {
            await fetchsongs(item.currentTarget.dataset.folder);
            currentaudio.src = songs[0];
            currentaudio.play();
            play.src = "pause.svg";
            document.querySelector('.songnaam').innerHTML = `${currentaudio.src.split('/public/songs/')[1].split('/')[1].replaceAll('%20', ' ').split('.mp3')[0].split('-')[0]}<br>${currentaudio.src.split('/public/songs/')[1].replaceAll('%20', ' ').split('.mp3')[0].split('-')[1]}`;
            document.querySelector('.left').style.left = 0;
        });
    });
}

async function main() {

    let play = document.getElementById('play');

    play.addEventListener('click', e => {
        if (currentaudio.paused) {
            currentaudio.play();
            play.src = "pause.svg";
        } else {
            currentaudio.pause();
            play.src = "playbar-play.svg";
        }
    });

    displayalbum();

    currentaudio.addEventListener('timeupdate', e => {
        document.querySelector('.songtime').innerHTML = `${formatTime(currentaudio.currentTime)} / ${formatTime(currentaudio.duration)}`;
        document.querySelector('.circle').style.left = (currentaudio.currentTime / currentaudio.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener('click', e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.circle').style.left = percent + "%";
        currentaudio.currentTime = (currentaudio.duration * percent) / 100;
    });

    document.querySelector('.hamburger').addEventListener('click', e => {
        document.querySelector('.left').style.left = 0;
    });

    document.querySelector('.close').addEventListener('click', e => {
        document.querySelector('.left').style.left = "-900px";
    });

    previous.addEventListener('click', () => {
        const current = decodeURIComponent(currentaudio.src.split("/public/songs/")[1]);
        const index = songs.findIndex(song => song.includes(current));
        console.log("Previous index:", index);
    
        if (index > 0) {
            const newSong = songs[index - 1];
            currentaudio.src = newSong;
            currentaudio.play();
    
            const name = newSong.split('/').pop().replace('.mp3', '').split(' - ');
            document.querySelector('.songnaam').innerHTML = `${name[0]}<br>${name[1]}`;
        }
    });
    
    next.addEventListener('click', () => {
        const current = decodeURIComponent(currentaudio.src.split("/public/songs/")[1]);
        const index = songs.findIndex(song => song.includes(current));
        console.log("Next index:", index);
    
        if (index !== -1 && index < songs.length - 1) {
            const newSong = songs[index + 1];
            currentaudio.src = newSong;
            currentaudio.play();
    
            const name = newSong.split('/').pop().replace('.mp3', '').split(' - ');
            document.querySelector('.songnaam').innerHTML = `${name[0]}<br>${name[1]}`;
        }
    });
    
    
    
    
    

    volicon.addEventListener('click', e => {
        volrange.style.display = (volrange.style.display == 'block') ? 'none' : 'block';
    });

    volrange.addEventListener('input', e => {
        currentaudio.volume = e.target.value / 100;
        if (currentaudio.volume == 0) {
            volicon.src = "mute.svg";
        } else if (currentaudio.volume < 0.5) {
            volicon.src = "lowvolume.svg";
        } else {
            volicon.src = "volume.svg";
        }
    });

    let mute = document.querySelector('.signin');
    mute.addEventListener('click', e => {
        if (currentaudio.volume != 0) {
            currentaudio.volume = 0;
            mute.style.backgroundColor = "black";
        } else {
            currentaudio.volume = 1;
            mute.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        }
    });
}

main();
