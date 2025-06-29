// DOM Elements
const audioPlayer = document.getElementById('audio-player');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const volumeSlider = document.getElementById('volume-slider');
const volumeDownIcon = document.getElementById('volume-down-icon');
const volumeUpIcon = document.getElementById('volume-up-icon');
const lyricsToggle = document.getElementById('lyrics-toggle');
const lyricsContainer = document.getElementById('lyrics-container');
const lyricsContent = document.getElementById('lyrics-content');
const lyricsTitle = document.getElementById('lyrics-title');
const lyricsArtist = document.getElementById('lyrics-artist');
const playlistContainer = document.getElementById('playlist-container');
const miniPlayer = document.getElementById('mini-player');
const miniArtwork = document.getElementById('mini-artwork');
const miniTitle = document.getElementById('mini-title');
const miniArtist = document.getElementById('mini-artist');
const miniPlayPauseBtn = document.getElementById('mini-play-pause-btn');
const miniPlayPauseIcon = document.getElementById('mini-play-pause-icon');
const nextBtn = document.querySelector('.ri-skip-forward-fill').closest('.control-btn');
const prevBtn = document.querySelector('.ri-skip-back-fill').closest('.control-btn');
const miniNextBtn = document.querySelector('.mini-player .ri-skip-forward-fill').closest('.mini-control-btn');
const miniPrevBtn = document.querySelector('.mini-player .ri-skip-back-fill').closest('.mini-control-btn');

// Player state
let currentTrackIndex = 0;
let isPlaying = false;
let currentLyrics = [];
let lyricElements = [];
let isLyricsVisible = false;

// Initialize player
function initPlayer() {
    renderPlaylist();
    loadTrack(currentTrackIndex);
    setupEventListeners();
}

// Render playlist
function renderPlaylist() {
    playlistContainer.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = `track-item ${index === currentTrackIndex ? 'active' : ''}`;
        trackItem.dataset.index = index;
        
        trackItem.innerHTML = `
            <div class="track-artwork">
                <img src="${track.artwork}" alt="${track.name}">
            </div>
            <div class="track-details">
                <p class="track-name">${track.name}</p>
                <p class="track-artist">${track.artist}</p>
            </div>
            <div class="track-action">
                <i class="${index === currentTrackIndex ? 'ri-volume-up-fill' : 'ri-more-2-fill'}"></i>
            </div>
        `;
        
        playlistContainer.appendChild(trackItem);
    });
}

// Load track
function loadTrack(index) {
    const track = tracks[index];
    
    // Update main player
    document.getElementById('current-artwork').src = track.artwork;
    document.getElementById('track-title').textContent = track.name;
    document.getElementById('track-artist').textContent = track.artist;
    
    // Update mini player
    miniArtwork.src = track.artwork;
    miniTitle.textContent = track.name;
    miniArtist.textContent = track.artist;
    
    // Update lyrics header
    lyricsTitle.textContent = `Lời bài hát - ${track.name}`;
    lyricsArtist.textContent = track.artist;
    
    // Set audio source
    audioPlayer.src = track.path;
    
    // Reset playback state
    progressBar.value = 0;
    currentTimeEl.textContent = '0:00';
    
    // Load lyrics
    loadLyrics(track.lyric);
    
    // Update playlist active state
    updatePlaylistActiveState(index);
}

// Load lyrics
async function loadLyrics(lyricUrl) {
    try {
        // Clear previous lyrics
        lyricsContent.innerHTML = '<div class="loading">Đang tải lời bài hát...</div>';
        currentLyrics = [];
        
        const response = await fetch(lyricUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const lyricHtml = await response.text();
        lyricsContent.innerHTML = lyricHtml;
        
        // Parse lyrics
        parseLyrics();
        
    } catch (error) {
        console.error('Lỗi khi tải lời bài hát:', error);
        lyricsContent.innerHTML = '<div class="error">Không tải được lời bài hát</div>';
        currentLyrics = [];
    }
}

// Parse lyrics elements
function parseLyrics() {
    lyricElements = Array.from(lyricsContent.querySelectorAll('p'));
    currentLyrics = lyricElements.map(lyric => {
        return {
            element: lyric,
            time: parseFloat(lyric.dataset.time || 0)
        };
    });
    
    // Auto-scroll to first lyric if visible
    if (isLyricsVisible && currentLyrics.length > 0) {
        currentLyrics[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Update playlist active state
function updatePlaylistActiveState(index) {
    const trackItems = document.querySelectorAll('.track-item');
    trackItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
            item.querySelector('.track-action i').className = 'ri-volume-up-fill';
        } else {
            item.classList.remove('active');
            item.querySelector('.track-action i').className = 'ri-more-2-fill';
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Play/Pause
    playPauseBtn.addEventListener('click', togglePlayPause);
    miniPlayPauseBtn.addEventListener('click', togglePlayPause);
    
    // Next track
    nextBtn.addEventListener('click', playNextTrack);
    miniNextBtn.addEventListener('click', playNextTrack);
    
    // Previous track
    prevBtn.addEventListener('click', playPreviousTrack);
    miniPrevBtn.addEventListener('click', playPreviousTrack);
    
    // Progress bar
    progressBar.addEventListener('input', seekAudio);
    progressBar.addEventListener('change', seekAudio);
    
    // Volume control
    volumeSlider.addEventListener('input', setVolume);
    
    // Lyrics toggle
    lyricsToggle.addEventListener('click', toggleLyrics);
    
    // Track selection
    playlistContainer.addEventListener('click', (e) => {
        const trackItem = e.target.closest('.track-item');
        if (trackItem) {
            const index = parseInt(trackItem.dataset.index);
            selectTrack(index);
        }
    });
    
    // Audio events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });
    audioPlayer.addEventListener('ended', playNextTrack);
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        playPauseIcon.className = 'ri-pause-fill';
        miniPlayPauseIcon.className = 'ri-pause-fill';
        document.getElementById('current-artwork').classList.add('playing-animation');
        miniPlayer.style.display = 'block';
    });
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        playPauseIcon.className = 'ri-play-fill';
        miniPlayPauseIcon.className = 'ri-play-fill';
        document.getElementById('current-artwork').classList.remove('playing-animation');
    });
    audioPlayer.addEventListener('error', (e) => {
        console.error('Lỗi phát nhạc:', e);
        alert('Không thể phát bài hát này. Vui lòng thử bài khác.');
    });
}

// Toggle play/pause
function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play().catch(error => {
            console.error('Lỗi khi phát:', error);
            alert('Không thể phát nhạc. Vui lòng thử lại.');
        });
    }
}

// Play next track
function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    selectTrack(currentTrackIndex);
    audioPlayer.play();
}

// Play previous track
function playPreviousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    selectTrack(currentTrackIndex);
    audioPlayer.play();
}

// Select track
function selectTrack(index) {
    currentTrackIndex = index;
    loadTrack(index);
    if (isPlaying) {
        audioPlayer.play();
    }
}

// Update progress
function updateProgress() {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    
    if (duration && isFinite(duration)) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.value = progressPercent;
        currentTimeEl.textContent = formatTime(currentTime);
        
        // Highlight current lyric
        updateActiveLyric(currentTime);
    }
}

// Seek audio
function seekAudio() {
    const seekTime = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
}

// Set volume
function setVolume() {
    const volume = volumeSlider.value / 100;
    audioPlayer.volume = volume;
    
    // Update volume icons
    if (volume < 0.3) {
        volumeDownIcon.className = 'ri-volume-mute-line';
        volumeUpIcon.className = 'ri-volume-up-line';
    } else if (volume < 0.7) {
        volumeDownIcon.className = 'ri-volume-down-line';
        volumeUpIcon.className = 'ri-volume-up-line';
    } else {
        volumeDownIcon.className = 'ri-volume-down-line';
        volumeUpIcon.className = 'ri-volume-up-line';
    }
}

// Toggle lyrics
function toggleLyrics() {
    isLyricsVisible = !isLyricsVisible;
    
    if (isLyricsVisible) {
        lyricsContainer.style.display = 'block';
        lyricsToggle.classList.add('active');
        
        // Scroll to active lyric if available
        const activeLyric = document.querySelector('.active-lyric');
        if (activeLyric) {
            activeLyric.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        lyricsContainer.style.display = 'none';
        lyricsToggle.classList.remove('active');
    }
}

// Update active lyric
function updateActiveLyric(currentTime) {
    if (currentLyrics.length === 0) return;
    
    // Clear active classes
    currentLyrics.forEach(lyric => {
        lyric.element.classList.remove('active-lyric');
    });
    
    // Find current lyric
    let currentLyric = null;
    for (let i = currentLyrics.length - 1; i >= 0; i--) {
        if (currentTime >= currentLyrics[i].time) {
            currentLyric = currentLyrics[i];
            break;
        }
    }
    
    // Apply active class
    if (currentLyric) {
        currentLyric.element.classList.add('active-lyric');
        
        // Auto-scroll if lyrics are visible
        if (isLyricsVisible) {
            currentLyric.element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }
}

// Format time (seconds to mm:ss)
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

// Initialize the player
document.addEventListener('DOMContentLoaded', initPlayer);