import { buildGA4Payload } from '@/_helpers/analytics'

describe('Analytics', () => {
  it('builds GA4 Measurement Protocol payload', () => {
    const payload = buildGA4Payload('client-id', {
      name: 'page_view',
      params: {
        page_path: '/dictpanel'
      }
    })

    expect(payload.client_id).toBe('client-id')
    expect(payload.events).toHaveLength(1)
    expect(payload.events[0]).toMatchObject({
      name: 'page_view',
      params: {
        engagement_time_msec: 1,
        page_path: '/dictpanel'
      }
    })
    expect(typeof payload.events[0].params.session_id).toBe('number')
  })
})
