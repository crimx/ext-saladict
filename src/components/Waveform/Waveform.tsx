import * as React from 'react'
import classNames from 'classnames'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js'
import NumberEditor from 'react-number-editor'
import { message, storage } from '@/_helpers/browser-api'
import { isFirefox } from '@/_helpers/saladict'
import { SoundTouch, SimpleFilter, getWebAudioNode } from 'soundtouchjs'

interface AnyObject {
  [index: string]: any
}

interface WaveformProps {
  darkMode: boolean
}

interface WaveformState {
  blob?: Blob
  isPlaying: boolean
  speed: number
  loop: boolean
  /** use pitch stretcher */
  pitchStretch: boolean
}

export class Waveform extends React.PureComponent<
  WaveformProps,
  WaveformState
> {
  containerRef = React.createRef<HTMLDivElement>()
  wavesurfer: WaveSurfer | null | undefined
  region: AnyObject | null | undefined
  soundTouch: AnyObject | null | undefined
  soundTouchNode: AnyObject | null | undefined
  /** Sync Wavesurfer & SoundTouch position */
  shouldSTSync: boolean = false
  /** play when file is loaded */
  playOnLoad = true
  src?: string

  state: WaveformState = {
    isPlaying: false,
    speed: 1,
    loop: false,
    pitchStretch: !isFirefox
  }

  initSoundTouch = (wavesurfer: WaveSurfer) => {
    const buffer = wavesurfer.backend.buffer
    const bufferLength = buffer.length
    const lChannel = buffer.getChannelData(0)
    const rChannel =
      buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : lChannel
    let seekingDiff = 0
    const source = {
      extract: (target, numFrames, position) => {
        if (this.shouldSTSync) {
          // get the new diff
          seekingDiff =
            ~~(wavesurfer.backend.getPlayedPercents() * bufferLength) - position
          this.shouldSTSync = false
        }

        position += seekingDiff

        for (let i = 0; i < numFrames; i++) {
          target[i * 2] = lChannel[i + position]
          target[i * 2 + 1] = rChannel[i + position]
        }

        return Math.min(numFrames, bufferLength - position)
      }
    }

    this.soundTouch = new SoundTouch(wavesurfer.backend.ac.sampleRate)
    this.soundTouchNode = getWebAudioNode(
      wavesurfer.backend.ac,
      new SimpleFilter(source, this.soundTouch)
    )
    wavesurfer.backend.setFilter(this.soundTouchNode)
  }

  initWavesurfer = () => {
    const wavesurfer = WaveSurfer.create({
      container: this.containerRef.current!,
      waveColor: '#f9690e',
      progressColor: '#B71C0C',
      plugins: [RegionsPlugin.create()]
    })

    this.wavesurfer = wavesurfer

    wavesurfer.enableDragSelection({})

    wavesurfer.on('region-created', region => {
      this.removeRegion()
      this.region = region
    })
    wavesurfer.on('region-update-end', this.play)
    wavesurfer.on('region-out', this.onPlayEnd)

    wavesurfer.on('seek', () => {
      if (!this.isInRegion()) {
        this.removeRegion()
      }
      this.shouldSTSync = true
    })

    wavesurfer.on('ready', this.onLoad)

    wavesurfer.on('finish', this.onPlayEnd)
  }

  onLoad = () => {
    if (this.playOnLoad) {
      this.play()
    }
    // reset state
    this.playOnLoad = true
  }

  play = () => {
    this.setState({ isPlaying: true })
    if (this.wavesurfer) {
      if (
        this.state.pitchStretch &&
        this.soundTouchNode &&
        this.wavesurfer.getFilters().length <= 0
      ) {
        this.wavesurfer.backend.setFilter(this.soundTouchNode)
      }
      if (this.region && !this.isInRegion()) {
        this.wavesurfer.play(this.region.start)
      } else {
        this.wavesurfer.play()
      }
    }
    this.shouldSTSync = true
  }

  pause = () => {
    this.setState({ isPlaying: false })
    if (this.soundTouchNode) {
      this.soundTouchNode.disconnect()
    }
    if (this.wavesurfer) {
      this.wavesurfer.pause()
      this.wavesurfer.backend.disconnectFilters()
    }
  }

  togglePlay = () => {
    this.state.isPlaying ? this.pause() : this.play()
  }

  onPlayEnd = () => {
    // could be region end
    this.state.loop ? this.play() : this.pause()
  }

  updateSpeed = (speed: number) => {
    this.setState({ speed })

    if (speed < 0.1 || speed > 3) {
      return
    }

    if (this.wavesurfer) {
      this.wavesurfer.setPlaybackRate(speed)
      if (speed !== 1 && this.state.pitchStretch && !this.soundTouch) {
        this.initSoundTouch(this.wavesurfer)
      }
      if (this.soundTouch) {
        this.soundTouch.tempo = speed
      }
    }

    this.shouldSTSync = true
  }

  toggleLoop = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ loop: e.currentTarget.checked })
    if (e.currentTarget.checked && !this.state.isPlaying) {
      this.play()
    }
  }

  togglePitchStretch = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.updatePitchStretch(e.currentTarget.checked)
    storage.local.set({ waveform_pitch: e.currentTarget.checked })
  }

  updatePitchStretch = (flag: boolean) => {
    this.setState({ pitchStretch: flag })

    if (flag) {
      if (
        this.state.speed !== 1 &&
        this.soundTouchNode &&
        this.wavesurfer &&
        this.wavesurfer.getFilters().length <= 0
      ) {
        this.wavesurfer.backend.setFilter(this.soundTouchNode)
        this.shouldSTSync = true
      }
    } else {
      if (this.soundTouchNode) {
        this.soundTouchNode.disconnect()
      }
      if (this.wavesurfer) {
        this.wavesurfer.backend.disconnectFilters()
      }
    }
  }

  isInRegion = (region = this.region): boolean => {
    if (region && this.wavesurfer) {
      const curTime = this.wavesurfer.getCurrentTime()
      return curTime >= region.start && curTime <= region.end
    }
    return false
  }

  removeRegion = () => {
    if (this.region) {
      this.region.remove()
    }
    this.region = null
  }

  reset = () => {
    this.removeRegion()
    this.updateSpeed(1)
    if (this.wavesurfer) {
      this.wavesurfer.pause()
      this.wavesurfer.empty()
      this.wavesurfer.backend.disconnectFilters()
    }
    if (this.soundTouch) {
      this.soundTouch.clear()
      this.soundTouch.tempo = 1
    }
    if (this.soundTouchNode) {
      this.soundTouchNode.disconnect()
    }
    this.soundTouch = null
    this.soundTouchNode = null
    this.shouldSTSync = false
  }

  load = (src: string) => {
    if (src) {
      if (this.wavesurfer) {
        this.reset()
      } else {
        this.initWavesurfer()
      }

      if (this.wavesurfer) {
        this.wavesurfer.load(src)
        // https://github.com/katspaugh/wavesurfer.js/issues/1657
        if (
          this.wavesurfer.backend.ac.state === 'suspended' &&
          this.playOnLoad
        ) {
          // fallback
          new Audio(src).play()
        }
      }
    } else {
      this.reset()
    }
  }

  async componentDidMount() {
    message.self.addListener('PLAY_AUDIO', async ({ payload: src }) => {
      this.load(src)
    })

    message.self
      .send<'LAST_PLAY_AUDIO'>({ type: 'LAST_PLAY_AUDIO' })
      .then(response => {
        if (
          response &&
          response.src &&
          response.timestamp - Date.now() < 10000
        ) {
          this.load(response.src)
        } else {
          this.playOnLoad = false
          this.load(
            // Nothing to play
            `https://fanyi.sogou.com/reventondc/synthesis?text=Nothing%20to%20play&speed=1&lang=en&from=translateweb`
          )
        }
      })

    storage.local.get('waveform_pitch').then(({ waveform_pitch }) => {
      if (waveform_pitch != null) {
        this.updatePitchStretch(Boolean(waveform_pitch))
      }
    })
  }

  componentWillUnmount() {
    this.reset()
    if (this.wavesurfer) {
      this.wavesurfer.destroy()
      this.wavesurfer = null
    }
  }

  render() {
    return (
      <div className={classNames({ darkMode: this.props.darkMode })}>
        <div className="saladict-waveformWrap saladict-theme">
          <div ref={this.containerRef} />
          <div className="saladict-waveformCtrl">
            <button
              type="button"
              className="saladict-waveformPlay"
              title="Play/Pause"
              onClick={this.togglePlay}
            >
              <div
                className={`saladict-waveformPlay_FG${
                  this.state.isPlaying ? ' isPlaying' : ''
                }`}
              />
            </button>
            <NumberEditor
              className="saladict-waveformSpeed"
              title="Speed"
              value={this.state.speed}
              min={0.1} // too low could cause error
              max={3}
              step={0.005}
              decimals={3}
              onValueChange={this.updateSpeed}
            />
            <label className="saladict-waveformBtn_label" title="Loop">
              {this.state.loop ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  fill="var(--color-font)"
                >
                  <path d="M23.242 388.417l162.59 120.596v-74.925h300.281l-.297-240.358-89.555-.239-.44 150.801H185.832l.81-75.934-163.4 120.06z" />
                  <path d="M490.884 120.747L328.294.15l.001 74.925H28.013l.297 240.358 89.555.239.44-150.801h209.99l-.81 75.934 163.4-120.06z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="var(--color-divider)"
                >
                  <path d="M 23.242 388.417 L 23.243 388.417 L 23.242 388.418 Z M 23.243 388.418 L 186.642 268.358 L 185.832 344.292 L 283.967 344.292 L 331.712 434.088 L 185.832 434.088 L 185.832 509.013 Z M 395.821 344.292 L 396.261 193.491 L 485.816 193.73 L 486.113 434.088 L 388.064 434.088 L 340.319 344.292 Z" />
                  <path d="M 490.884 120.747 L 490.883 120.746 L 490.885 120.745 Z M 490.883 120.746 L 327.485 240.805 L 328.295 164.871 L 244.267 164.871 L 196.521 75.075 L 328.295 75.075 L 328.294 0.15 Z M 118.305 164.871 L 117.865 315.672 L 28.31 315.433 L 28.013 75.075 L 141.077 75.075 L 188.823 164.871 Z" />
                  <rect
                    x="525.825"
                    y="9.264"
                    width="45.879"
                    height="644.398"
                    transform="matrix(0.882947, -0.469472, 0.469472, 0.882947, -403.998657, 225.106232)"
                  />
                </svg>
              )}
              <input
                type="checkbox"
                checked={this.state.loop}
                onChange={this.toggleLoop}
              />
            </label>
            {!isFirefox && ( // @TOFIX SoundTouch bug with Firefox
              <label
                className="saladict-waveformPitch saladict-waveformBtn_label"
                title="Pitch Stretch"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 467.987 467.987"
                  fill={
                    this.state.pitchStretch
                      ? 'var(--color-font)'
                      : 'var(--color-divider)'
                  }
                >
                  <path d="M70.01 146.717h47.924V321.27H70.01zM210.032 146.717h47.924V321.27h-47.924zM350.053 146.717h47.924V321.27h-47.924zM0 196.717h47.924v74.553H0zM280.042 196.717h47.924v74.553h-47.924zM420.063 196.717h47.924v74.553h-47.924zM140.021 96.717h47.924V371.27h-47.924z" />
                </svg>
                <input
                  type="checkbox"
                  checked={this.state.pitchStretch}
                  onChange={this.togglePitchStretch}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default Waveform
