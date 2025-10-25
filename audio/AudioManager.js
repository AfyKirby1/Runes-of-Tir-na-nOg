export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.isEnabled = true;
        this.volume = 0.5;
        this.initializeAudio();
    }

    initializeAudio() {
        try {
            // Create audio context for Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
            this.isEnabled = false;
        }
    }

    createWaterSound() {
        if (!this.audioContext || !this.isEnabled) return null;

        try {
            // Create a simple water sound using Web Audio API
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();

            // Configure filter for water-like sound
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
            filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);

            // Configure gain for volume control
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

            // Configure oscillator for water-like frequency
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.3);

            // Connect nodes
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            return { oscillator, gainNode };
        } catch (error) {
            console.error('Failed to create water sound:', error);
            return null;
        }
    }

    playWaterSound() {
        if (!this.isEnabled) return;

        // Resume audio context if suspended (required for user interaction)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const sound = this.createWaterSound();
        if (sound) {
            sound.oscillator.start();
            sound.oscillator.stop(this.audioContext.currentTime + 0.3);
        }
    }

    playFootstepSound() {
        if (!this.isEnabled) return;

        // Resume audio context if suspended
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        try {
            // Create a simple footstep sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();

            // Configure for footstep-like sound
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(1200, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.05, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);

            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.error('Failed to create footstep sound:', error);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    isAudioEnabled() {
        return this.isEnabled && this.audioContext !== null;
    }
}
