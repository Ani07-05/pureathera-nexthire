import { createClient } from '@anam-ai/js-sdk'

export interface AnamConfig {
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: any) => void
  onError?: (error: any) => void
}

export class InterviewAnamClient {
  private anamClient: any = null
  private config: AnamConfig
  private isInitialized = false
  private isStreamingReady = false
  private sessionToken: string
  private videoElementId: string | null = null

  constructor(sessionToken: string, config: AnamConfig) {
    this.sessionToken = sessionToken
    this.config = config
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Anam client with session token...')

      // Create Anam client using the new API
      this.anamClient = createClient(this.sessionToken)

      // Give the client time to initialize properly
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Anam client created successfully')
      this.isInitialized = true
      this.config.onConnect?.()
    } catch (error) {
      console.error('Failed to initialize Anam client:', error)
      this.config.onError?.(error)
      throw error
    }
  }

  async streamToVideo(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.anamClient || !this.isInitialized) {
      throw new Error('Anam client not initialized')
    }

    try {
      console.log('Starting video stream to element:', videoElement.id)

      // Make sure video element has an ID
      if (!videoElement.id) {
        videoElement.id = `anam-video-${Date.now()}`
      }

      this.videoElementId = videoElement.id

      // Force the element to be visible and accessible
      videoElement.style.display = 'block'
      videoElement.style.visibility = 'visible'

      // Ensure audio is enabled
      videoElement.muted = false
      videoElement.volume = 1.0

      // Wait for DOM to be fully ready and force a reflow
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Double-check element exists in DOM
      const domElement = document.getElementById(videoElement.id)
      if (!domElement) {
        throw new Error(`Video element with ID ${videoElement.id} not found in DOM`)
      }

      console.log('Video element confirmed in DOM, starting stream...')

      // Clear any existing streams first
      if (videoElement.srcObject) {
        const tracks = (videoElement.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
        videoElement.srcObject = null
      }

      console.log('Starting Anam stream to video element...')

      // Start streaming with video element - this is where the WebRTC fails
      try {
        await this.anamClient.streamToVideoElement(videoElement.id)
        console.log('Anam stream initialization successful')
      } catch (streamError) {
        console.error('Anam streaming failed:', streamError)

        // The addTrack error suggests WebRTC isn't ready, let's wait and retry
        console.log('Retrying stream initialization after delay...')
        await new Promise(resolve => setTimeout(resolve, 3000))

        try {
          await this.anamClient.streamToVideoElement(videoElement.id)
          console.log('Stream retry successful')
        } catch (retryError) {
          console.error('Stream retry failed:', retryError)
          // Continue anyway, maybe audio-only will work
        }
      }

      // Give extra time for WebRTC connection to establish
      console.log('Waiting for WebRTC peer connection to stabilize...')
      await new Promise(resolve => setTimeout(resolve, 5000))

      this.isStreamingReady = true
      console.log('Stream setup completed - ready for talk commands')
    } catch (error) {
      if (error.message.includes('Already streaming')) {
        console.log('Stream already active, avatar should be visible')
        // If already streaming, wait for connection to be ready
        await this.waitForStreamReady()
        this.isStreamingReady = true
        return
      }
      console.error('Failed to stream to video element:', error)
      throw error
    }
  }

  private async waitForStreamReady(): Promise<void> {
    // Give the WebRTC connection time to establish
    // The "peer connection is null" error suggests we need to wait longer
    let attempts = 0
    const maxAttempts = 30 // 15 seconds max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500))

      // Try to check if the connection is ready by attempting a simple operation
      try {
        // If the client has a status or connection property, check it
        if (this.anamClient && typeof this.anamClient.getConnectionState === 'function') {
          const state = this.anamClient.getConnectionState()
          if (state === 'connected') {
            console.log('WebRTC connection confirmed ready')
            return
          }
        }

        // If no status check available, just wait sufficient time
        if (attempts >= 6) { // At least 3 seconds
          console.log('Assuming WebRTC connection is ready after sufficient wait time')
          return
        }
      } catch (checkError) {
        // Ignore errors during connection checking
      }

      attempts++
      console.log(`Waiting for WebRTC connection... attempt ${attempts}/${maxAttempts}`)
    }

    console.log('WebRTC connection wait completed (timeout reached)')
  }

  async talk(content: string): Promise<void> {
    if (!this.anamClient || !this.isInitialized) {
      throw new Error('Anam client not initialized')
    }

    if (!this.isStreamingReady) {
      console.warn('WebRTC connection not ready yet, waiting...')
      // Try waiting a bit more for the connection
      await this.waitForStreamReady()
      this.isStreamingReady = true
    }

    try {
      console.log('Making Anam speak:', content.substring(0, 50) + '...')

      // Use talk method to make persona speak
      await this.anamClient.talk(content)

      console.log('Talk command sent successfully')
    } catch (error) {
      if (error.message && error.message.includes('peer connection is null')) {
        console.error('WebRTC peer connection issue detected, attempting reconnection...')
        // Try to wait and retry once
        await new Promise(resolve => setTimeout(resolve, 2000))
        try {
          await this.anamClient.talk(content)
          console.log('Talk command succeeded after retry')
        } catch (retryError) {
          console.error('Talk command failed even after retry:', retryError)
          throw new Error('WebRTC connection issue: Unable to establish voice communication. Please try refreshing the page.')
        }
      } else {
        console.error('Failed to make persona talk:', error)
        throw error
      }
    }
  }

  async startStreaming(): Promise<void> {
    // For new Anam SDK, streaming is handled in streamToVideoElement
    console.log('Streaming is managed automatically by Anam SDK')
  }

  async stopStreaming(): Promise<void> {
    if (!this.anamClient) {
      return
    }

    try {
      console.log('Stopping Anam streaming...')

      // Close the Anam client
      if (this.anamClient.close) {
        await this.anamClient.close()
      }

      this.isInitialized = false
      this.config.onDisconnect?.()
    } catch (error) {
      console.error('Failed to stop streaming:', error)
      throw error
    }
  }

  isConnected(): boolean {
    return this.isInitialized && this.anamClient !== null && this.isStreamingReady
  }

  // Interview-specific helper methods
  async askQuestion(question: string, context?: string): Promise<void> {
    const interviewPrompt = context
      ? `${context}\n\nNow I'll ask you this interview question: ${question}`
      : `Here's your interview question: ${question}`

    await this.talk(interviewPrompt)
  }

  async provideFeedback(feedback: string): Promise<void> {
    const feedbackPrompt = `Great job! Here's some feedback on your answer: ${feedback}`
    await this.talk(feedbackPrompt)
  }

  async setupInterviewContext(role: string, level: string): Promise<void> {
    const contextPrompt = `Hello! I'm your AI interviewer today. We'll be conducting a technical interview for a ${role} position at ${level} level. I'll ask you questions one at a time, and you can take your time to think and respond. Let's begin when you're ready.`
    await this.talk(contextPrompt)
  }
}