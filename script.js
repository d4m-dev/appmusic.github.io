document.addEventListener('DOMContentLoaded', function() {
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
    const nextBtn = document.querySelector('.ri-skip-forward-fill').parentElement;
    const prevBtn = document.querySelector('.ri-skip-back-fill').parentElement;
    const miniNextBtn = miniPlayer.querySelector('.ri-skip-forward-fill').parentElement;
    const miniPrevBtn = miniPlayer.querySelector('.ri-skip-back-fill').parentElement;
    
    // Player state
    let currentTrackIndex = 0;
    let isPlaying = false;
    let currentLyrics = [];
    
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
            trackItem.className = `track-item flex items-center p-3 rounded-lg cursor-pointer ${index === currentTrackIndex ? 'active' : ''}`;
            trackItem.dataset.index = index;
            
            trackItem.innerHTML = `
                <div class="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                    <img src="${track.artwork}" alt="${track.name}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">${track.name}</p>
                    <p class="text-xs text-gray-500 truncate">${track.artist}</p>
                </div>
                <div class="w-8 h-8 flex items-center justify-center">
                    <i class="${index === currentTrackIndex ? 'ri-volume-up-fill text-primary' : 'ri-more-2-fill text-gray-400'}"></i>
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
            const response = await fetch(lyricUrl);
            const html = await response.text();
            lyricsContent.innerHTML = html;
            currentLyrics = Array.from(lyricsContent.querySelectorAll('p'));
        } catch (error) {
            console.error('Error loading lyrics:', error);
            lyricsContent.innerHTML = '<p class="text-center text-gray-500">Không tải được lời bài hát</p>';
            currentLyrics = [];
        }
    }
    
    // Update playlist active state
    function updatePlaylistActiveState(index) {
        const trackItems = document.querySelectorAll('.track-item');
        trackItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
                item.querySelector('i').className = 'ri-volume-up-fill text-primary';
            } else {
                item.classList.remove('active');
                item.querySelector('i').className = 'ri-more-2-fill text-gray-400';
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
            playPauseIcon.className = 'ri-pause-fill text-white text-3xl';
            miniPlayPauseIcon.className = 'ri-pause-fill text-white';
            document.getElementById('current-artwork').classList.add('playing-animation');
            miniPlayer.classList.remove('hidden');
        });
        audioPlayer.addEventListener('pause', () => {
            isPlaying = false;
            playPauseIcon.className = 'ri-play-fill text-white text-3xl';
            miniPlayPauseIcon.className = 'ri-play-fill text-white';
            document.getElementById('current-artwork').classList.remove('playing-animation');
        });
    }
    
    // Toggle play/pause
    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play().catch(error => {
                console.error('Playback failed:', error);
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
        
        if (duration) {
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
            volumeDownIcon.className = 'ri-volume-mute-line text-gray-600';
            volumeUpIcon.className = 'ri-volume-up-line text-gray-400';
        } else if (volume < 0.7) {
            volumeDownIcon.className = 'ri-volume-down-line text-gray-600';
            volumeUpIcon.className = 'ri-volume-up-line text-gray-400';
        } else {
            volumeDownIcon.className = 'ri-volume-down-line text-gray-400';
            volumeUpIcon.className = 'ri-volume-up-line text-gray-600';
        }
    }
    
    // Toggle lyrics
    function toggleLyrics() {
        if (lyricsContainer.classList.contains('hidden')) {
            lyricsContainer.classList.remove('hidden');
            lyricsToggle.classList.add('bg-primary', 'text-white');
            lyricsToggle.classList.remove('bg-primary/10', 'text-primary');
            
            // Scroll to active lyric
            const activeLyric = document.querySelector('.active-lyric');
            if (activeLyric) {
                activeLyric.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            lyricsContainer.classList.add('hidden');
            lyricsToggle.classList.remove('bg-primary', 'text-white');
            lyricsToggle.classList.add('bg-primary/10', 'text-primary');
        }
    }
    
    // Update active lyric
    function updateActiveLyric(currentTime) {
        if (currentLyrics.length === 0) return;
        
        let activeFound = false;
        let currentLyricIndex = 0;
        
        // Find the current lyric
        for (let i = 0; i < currentLyrics.length; i++) {
            const lyricTime = parseFloat(currentLyrics[i].dataset.time);
            if (lyricTime <= currentTime) {
                currentLyricIndex = i;
            } else {
                break;
            }
        }
        
        // Update classes
        currentLyrics.forEach((lyric, index) => {
            if (index === currentLyricIndex) {
                lyric.classList.add('active-lyric');
                activeFound = true;
            } else {
                lyric.classList.remove('active-lyric');
            }
        });
        
        // Auto-scroll if lyrics are visible
        if (!lyricsContainer.classList.contains('hidden') && activeFound) {
            currentLyrics[currentLyricIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    // Format time (seconds to mm:ss)
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    }
    
    // Initialize the player
    initPlayer();
});