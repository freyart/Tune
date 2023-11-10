
const playlistSelect = document.getElementById('playlist');
const categorySelect = document.getElementById('category');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const volumeControl = document.getElementById('volumeControl');
const audioPlayer = new Audio();
let selectedTunes = [];
let paused = false;

// Set initial volume on load
audioPlayer.volume = 0.5;

// Fetch the playlist data
  populateCategorySelect();
  populatePlaylist(playlistData);

// Event Listeners
playButton.addEventListener('click', handlePlayButtonClick);
pauseButton.addEventListener('click', handlePauseButtonClick);
stopButton.addEventListener('click', handleStopButtonClick);
volumeControl.addEventListener('input', handleVolumeInputChange);
categorySelect.addEventListener('change', handleCategorySelectChange);
playlistSelect.addEventListener('dblclick', handlePlaylistDoubleClick);

// Function to handle the play button
function handlePlayButtonClick() {
  selectedTunes = Array.from(playlistSelect.selectedOptions)
    .map(option => parseInt(option.value));
  
  if (selectedTunes.length > 0) {
    paused = false;
    playNextTune();
  }
}

// Function to handle the pause button
function handlePauseButtonClick() {
  if (paused) {
    audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
  paused = !paused;

  // Toggle the 'playing' class on the pause button
  pauseButton.classList.toggle('paused', paused);
  // Add or remove the 'paused-outline' class for visual feedback
  pauseButton.classList.toggle('paused-outline', paused);
}

// Function to handle the stop button
function handleStopButtonClick() {
  if (!audioPlayer.paused) {
    // Initiate a fade-out effect
    fadeOutAudio();
  }
}

// Function to handle the fade-out effect
function fadeOutAudio() {
  const fadeOutInterval = 50; // Adjust the interval as needed
  const fadeOutDuration = 3000; // 3 seconds

  // Calculate the number of steps needed for the fade-out
  const numberOfSteps = Math.ceil(fadeOutDuration / fadeOutInterval);
  const volumeStep = audioPlayer.volume / numberOfSteps;

  // Create an interval to decrease the volume gradually
  const fadeOutIntervalId = setInterval(() => {
    if (audioPlayer.volume - volumeStep > 0) {
      audioPlayer.volume -= volumeStep;
    } else {
      // If volume is already very low, clear the interval and stop the audio
      clearInterval(fadeOutIntervalId);
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      audioPlayer.volume = 1; // Reset volume to its original level
      paused = false;
      removePlayedStyle();
    }
  }, fadeOutInterval);
}

// Function to handle the change of volume
function handleVolumeInputChange() {
  audioPlayer.volume = volumeControl.value;
}

// Function to handle the change of category
function handleCategorySelectChange() {
  const selectedCategory = categorySelect.value;
  if (selectedCategory === "") {
    populatePlaylist(playlistData);
  } else {
    populatePlaylist(playlistData.filter(tune => tune.category === selectedCategory));
  }
}

// Function to handle the Playlist double click
function handlePlaylistDoubleClick() {
  const selectedOption = playlistSelect.selectedOptions[0];
  if (selectedOption) {
    const tuneIndex = parseInt(selectedOption.value);
    playTuneByIndex(tuneIndex);
  }
}

// Function to populate the category select control
function populateCategorySelect() {
  const nullOption = document.createElement('option');
  nullOption.value = "";
  nullOption.textContent = "";
  categorySelect.appendChild(nullOption);

  const categories = [...new Set(playlistData.map(tune => tune.category))];

  categories.forEach(category => {
    const categoryOption = document.createElement('option');
    categoryOption.value = category;
    categoryOption.textContent = category;
    categorySelect.appendChild(categoryOption);
  });
}

// Function to populate the playlist with options based on the selected category
function populatePlaylist(filteredTunes) {
  // Clear the existing options
  playlistSelect.innerHTML = '';

  filteredTunes.forEach((tune, index) => {
    const tuneOption = document.createElement('option');
    tuneOption.value = index;
    tuneOption.textContent = tune.name;
    playlistSelect.appendChild(tuneOption);
  });

  // Store the loaded tunes for reference
  window.tunes = filteredTunes;
}

// Function to play the next selected tune
function playNextTune() {
  // Remove any existing event listener
  audioPlayer.removeEventListener('ended', playNextTune);

  removePlayedStyle();

  if (selectedTunes.length === 0) {
    // If no more tunes in the queue, pause playback
    audioPlayer.pause();
    paused = true;
    return;
  }

  const currentTuneIndex = selectedTunes[0]; // Peek at the next tune without removing it
  const currentTune = window.tunes[currentTuneIndex];

  // Set audio source and play the audio
  audioPlayer.src = currentTune.url;
  audioPlayer.play();

  // Add 'playing' class to currently playing tune
  const currentPlayingOption = playlistSelect.querySelector(`option[value="${currentTuneIndex}"]`);
  if (currentPlayingOption) {
    currentPlayingOption.classList.add('playing');
  }

  // Add an event listener for audio playback completion
  audioPlayer.addEventListener('ended', playNextTune);
}

// Function to play a tune by its index
function playTuneByIndex(index) {
  paused = false;
  selectedTunes = [index];
  playNextTune();
}

// Function to play a tune by its id
function playTuneById(trackId) {
  paused = false;
  const index = playlistData.findIndex(track => track.id === trackId);
  if (index !== -1) {
    selectedTunes = [index];
    playNextTune();
  }
}

function removePlayedStyle(){
  // Remove 'playing' class from previous playing tune
  const previousPlayingOption = playlistSelect.querySelector('.playing');
  if (previousPlayingOption) {
    previousPlayingOption.classList.remove('playing');
  }
}