import audio from '@/background/audio-manager'

describe('Audio Manager', () => {
  const bakAudio = (window as any).Audio
  const mockAudioInstances: any[] = []
  const mockAudio = jest.fn(() => {
    const instance = {
      play: jest.fn(() => Promise.resolve()),
      pause: jest.fn(),
      addEventListener: jest.fn(),
    }
    mockAudioInstances.push(instance)
    return instance
  })
  beforeAll(() => {
    (window as any).Audio = mockAudio
  })
  afterAll(() => {
    (window as any).Audio = bakAudio
  })
  beforeEach(() => {
    delete window.__audio_manager__
    mockAudio.mockClear()
    mockAudioInstances.length = 0
  })

  it('load', () => {
    const url = 'https://e.a/load.mp3'
    expect(audio.load(url)).toBe(mockAudioInstances[0])
    expect(mockAudio).toBeCalledWith(url)
  })

  it('play', () => {
    const url = 'https://e.b/play.mp3'
    expect(audio.play(url)).toBeInstanceOf(Promise)
    expect(mockAudio).toBeCalledWith(url)
    expect(mockAudioInstances.length).toBe(1)
    expect(mockAudioInstances[0].play).toHaveBeenCalledTimes(1)
  })

  it('play x 2 interrupted', () => {
    const url1 = 'https://e.b/play1.mp3'
    const url2 = 'https://e.b/play2.mp3'
    expect(audio.load(url1)).toBe(mockAudioInstances[0])
    expect(mockAudio).toBeCalledWith(url1)
    expect(audio.play(url2)).toBeInstanceOf(Promise)
    expect(mockAudio).toBeCalledWith(url2)
    expect(mockAudioInstances.length).toBe(2)
    expect(mockAudioInstances[0].play).toHaveBeenCalledTimes(0)
    expect(mockAudioInstances[0].pause).toHaveBeenCalledTimes(1)
    expect(mockAudioInstances[1].play).toHaveBeenCalledTimes(1)
    expect(mockAudioInstances[1].pause).toHaveBeenCalledTimes(0)
  })

  it('listen', () => {
    const url = 'https://e.b/play.mp3'
    expect(audio.load(url)).toBe(mockAudioInstances[0])
    expect(mockAudio).toBeCalledWith(url)
    const listener = () => {}
    audio.addListener('play', listener)
    expect(mockAudioInstances[0].addEventListener).toBeCalledWith('play', listener)
  })
})
