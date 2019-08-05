import { MockRequest } from '@/components/dictionaries/helpers'

export const mockSearchTexts = ['I love you']

export const mockRequest: MockRequest = mock => {
  mock.onGet('https://fanyi.qq.com').reply(
    200,
    `<script>
        var qtv = "a43e4a465d62a61d";
        var qtk = "BTzoGIJKQtwxxerv36OTX86oZlS1rjHVcsPZXQqUefoqkxxx+QctJ7aotH3kZcersXJVjrDKF7lpdjsqzEo0qdUY9sQ9sa9Fdla06dwqZ2mFckRqVqyqUXYnTAnm9jrzs24kYuvWFukk/jjdhWU8uA==";
        document.cookie = "qtv=a43e4a465d62a61d";
        document.cookie = "qtk=BTzoGIJKQtwxxerv36OTX86oZlS1rjHVcsPZXQqUefoqkxxx+QctJ7aotH3kZcersXJVjrDKF7lpdjsqzEo0qdUY9sQ9sa9Fdla06dwqZ2mFckRqVqyqUXYnTAnm9jrzs24kYuvWFukk/jjdhWU8uA==";
    </script>`
  )

  mock.onPost(/qq/).reply(200, require('./response/i-love-you.json'))
}
