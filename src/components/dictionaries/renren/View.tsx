import React, { FC, useState, useEffect } from 'react'
import Speaker from '@/components/Speaker'
import { RenrenResult, RenrenSlide } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { message } from '@/_helpers/browser-api'

interface RenrenSlideProps {
  slide: RenrenSlide
}

const Slide: FC<RenrenSlideProps> = ({ slide }) => {
  const [imgHeight, setImgHeight] = useState(240)
  const [isImgLoaded, setImgLoaded] = useState(false)
  useEffect(() => {
    setImgLoaded(false)
  }, [slide.cover])

  return (
    <div className="dictRenren-Slide">
      <div className="dictRenren-Slide_Speaker">
        <Speaker src={slide.mp3} width={20} />
      </div>
      <figure style={{ height: imgHeight }}>
        <img
          src={slide.cover}
          alt={slide.en}
          className={`dictRenren-Slide_Cover${isImgLoaded ? ' isLoaded' : ''}`}
          onLoad={e => {
            setImgHeight(e.currentTarget.height)
            setImgLoaded(true)
          }}
        />
        <figcaption>
          <p
            dangerouslySetInnerHTML={{ __html: slide.en }}
            className="dictRenren-Slide_En"
          />
          <p className="dictRenren-Slide_Chs">{slide.chs}</p>
        </figcaption>
      </figure>
    </div>
  )
}

export const DictRenren: FC<ViewPorps<RenrenResult>> = ({ result }) => {
  const [slide, setSlide] = useState(0)
  const [details, setDetails] = useState<{ [k: string]: RenrenSlide[] }>({})

  useEffect(() => {
    setSlide(0)
  }, [result])

  const handleDetailClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    const selectedSlide = result[slide]
    const detail = await message.send<'DICT_ENGINE_METHOD', RenrenSlide[]>({
      type: 'DICT_ENGINE_METHOD',
      payload: {
        id: 'renren',
        method: 'getDetail',
        args: [selectedSlide.detail]
      }
    })

    if (detail && detail.length > 0) {
      setDetails(details => ({
        ...details,
        [selectedSlide.key]: detail
      }))
    }
  }

  return (
    <>
      <select
        className="dictRenren-Selector"
        onChange={e => setSlide(Number(e.currentTarget.value) || 0)}
        value={slide}
      >
        {result.map((item, i) => (
          <option key={item.key} value={i}>
            {item.title}
          </option>
        ))}
      </select>
      {details[result[slide].key] ? (
        details[result[slide].key].map(slide => (
          <Slide key={slide.cover + slide.mp3} slide={slide} />
        ))
      ) : (
        <>
          <Slide slide={result[slide].slide} />
          <a
            className="dictRenren-Detail"
            href={result[slide].detail}
            onClick={handleDetailClick}
          >
            ⤋查看详情
          </a>
          {result[slide].context.map(ctx => (
            <div key={ctx.title} className="dictRenren-Ctx">
              <p className="dictRenren-Ctx_Title">{ctx.title}</p>
              <div className="dictRenren-Ctx_Subtitles">
                {ctx.content.map(subtitle => (
                  <p key={subtitle}>{subtitle}</p>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  )
}

export default DictRenren
