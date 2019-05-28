import * as React from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js'
import NumberEditor from 'react-number-editor'
import { message } from '@/_helpers/browser-api'
import { MsgType, MsgAudioPlay } from '@/typings/message'

interface WaveformState {
  blob?: Blob
  isPlaying: boolean
  speed: number
  loop: boolean
}

export default class Waveform extends React.PureComponent<
  {},
  WaveformState
> {
  wavesurfer: WaveSurfer | null | undefined
  region: any | null | undefined
  src?: string

  state: WaveformState = {
    isPlaying: false,
    speed: 1,
    loop: false
  }

  initWavesurfer () {
    const wavesurfer = WaveSurfer.create({
      container: '#waveform-container',
      waveColor: '#f9690e',
      progressColor: '#B71C0C',
      plugins: [RegionsPlugin.create()]
    })

    this.wavesurfer = wavesurfer

    wavesurfer.enableDragSelection({})

    wavesurfer.on('region-created', region => {
      this.removeRegin()
      this.region = region
    })
    wavesurfer.on('region-update-end', region => {
      this.play(region.start)
    })
    wavesurfer.on('region-out', this.onPlayEnd)

    wavesurfer.on('seek', () => {
      if (this.region) {
        const curTime = wavesurfer.getCurrentTime()
        if (curTime < this.region.start || curTime > this.region.end) {
          this.removeRegin()
        }
      }
    })

    wavesurfer.on('ready', this.play)
    wavesurfer.on('finish', this.onPlayEnd)
  }

  play = (start?: number) => {
    if (!this.wavesurfer) {
      return
    }
    this.setState({ isPlaying: true })
    this.wavesurfer.play(start)
  }

  pause = () => {
    if (!this.wavesurfer) {
      return
    }
    this.setState({ isPlaying: false })
    this.wavesurfer.pause()
  }

  togglePlay = () => {
    this.state.isPlaying ? this.pause() : this.play()
  }

  onPlayEnd = () => {
    if (this.state.loop) {
      this.play(this.region && this.region.start)
    } else {
      this.setState({ isPlaying: false })
    }
  }

  updateSpeed = (speed: number) => {
    if (this.wavesurfer) {
      this.wavesurfer.setPlaybackRate(speed)
    }
    this.setState({ speed })
  }

  updateLoop = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ loop: e.currentTarget.checked })
  }

  removeRegin = () => {
    if (this.region) {
      this.region.remove()
    }
    this.region = null
  }

  componentDidMount () {
    message.self.addListener<MsgAudioPlay>(MsgType.PlayAudio, async message => {
      console.log('play', message)
      if (message.src) {
        this.src = message.src
        if (!this.wavesurfer) {
          this.initWavesurfer()
        }
        this.removeRegin()
        this.wavesurfer!.empty()
        this.wavesurfer!.load(message.src)
        // https://github.com/katspaugh/wavesurfer.js/issues/1657
        if (this.wavesurfer!.backend.ac.state === 'suspended') {
          // fallback
          new Audio(message.src).play()
        }
      } else {
        if (this.wavesurfer) {
          this.wavesurfer.pause()
        }
      }
    })
  }

  componentWillUnmount () {
    if (this.wavesurfer) {
      this.wavesurfer.destroy()
      this.wavesurfer = null
    }
  }

  render () {
    return (
      <div className='saladict-waveformWrap'>
        <div id='waveform-container' />
        <div className='saladict-waveformCtrl'>
          <button
            type='button'
            className='saladict-waveformPlay'
            title='Play/Pause'
            onClick={this.togglePlay}
          >
            <div
              className={`saladict-waveformPlay_FG${
                this.state.isPlaying ? ' isPlaying' : ''
              }`}
            />
          </button>
          <NumberEditor
            className='saladict-waveformSpeed'
            title='Speed'
            value={this.state.speed}
            min={0.1} // too low could cause error
            max={3}
            step={0.01}
            decimals={3}
            onValueChange={this.updateSpeed}
          />
          <label className='saladict-waveformLoop' title='Loop'>
            {this.state.loop ? (
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='#333'>
                <path d='M23.242 388.417l162.59 120.596v-74.925h300.281l-.297-240.358-89.555-.239-.44 150.801H185.832l.81-75.934-163.4 120.06z' />
                <path d='M490.884 120.747L328.294.15l.001 74.925H28.013l.297 240.358 89.555.239.44-150.801h209.99l-.81 75.934 163.4-120.06z' />
              </svg>
            ) : (
              <svg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg' fill='#999'>
                <path d='M 23.242 388.417 L 23.243 388.417 L 23.242 388.418 Z M 23.243 388.418 L 186.642 268.358 L 185.832 344.292 L 283.967 344.292 L 331.712 434.088 L 185.832 434.088 L 185.832 509.013 Z M 395.821 344.292 L 396.261 193.491 L 485.816 193.73 L 486.113 434.088 L 388.064 434.088 L 340.319 344.292 Z' />
                <path d='M 490.884 120.747 L 490.883 120.746 L 490.885 120.745 Z M 490.883 120.746 L 327.485 240.805 L 328.295 164.871 L 244.267 164.871 L 196.521 75.075 L 328.295 75.075 L 328.294 0.15 Z M 118.305 164.871 L 117.865 315.672 L 28.31 315.433 L 28.013 75.075 L 141.077 75.075 L 188.823 164.871 Z' />
                <rect x='525.825' y='9.264' width='45.879' height='644.398' transform='matrix(0.882947, -0.469472, 0.469472, 0.882947, -403.998657, 225.106232)' />
              </svg>
            )}
            <input
              type='checkbox'
              checked={this.state.loop}
              onChange={this.updateLoop}
            />
          </label>
        </div>
      </div>
    )
  }
}
