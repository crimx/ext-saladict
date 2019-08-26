import { createSelectTextStream } from '@/selection/select-text'
import getDefaultConfig from '@/app-config'
import { of } from 'rxjs'
import { createMousedownStream } from '@/selection/mouse-events'

const config = getDefaultConfig()

createSelectTextStream(of(config), createMousedownStream()).subscribe(
  console.log
)
