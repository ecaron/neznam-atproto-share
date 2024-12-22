/* global jQuery */
(function ($) {
  /*
  MIT License

  Copyright (c) 2024 Nicholas Sideras

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  */

  const rootElement = document.querySelector('#neznam-atproto-share-comments')
  if (!rootElement || !rootElement.dataset.uri) return
  const atProto = rootElement.dataset.uri

  fetch(
    'https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=' + atProto
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (
        typeof data.thread.replies !== 'undefined' &&
        data.thread.replies.length > 0
      ) {
        rootElement.replaceChildren(renderComments(data.thread))
        const someReplies = document.createElement('div')
        someReplies.innerHTML = '<a href="' + ToBskyUrl(rootElement.dataset.uri) + '">Post a reply on BlueSky</a>'
        rootElement.append(someReplies)
      } else {
        const noReplies = document.createElement('em')
        noReplies.innerHTML = 'No replies. <a href="' + ToBskyUrl(rootElement.dataset.uri) + '">Post a reply on BlueSky</a>'
        rootElement.replaceChildren(noReplies)
      }
    })
    .catch((error) => {
      console.warn(error)
      const p = document.createElement('p')
      p.appendChild(document.createTextNode(`Error: ${error.message}`))
      document.body.appendChild(p, rootElement)
    })

  function ToBskyUrl (uri) {
    const splitUri = uri.split('/')
    if (splitUri[0] === 'at:') {
      return 'https://bsky.app/profile/' + splitUri[2] + '/post/' + splitUri[4]
    } else {
      return uri
    }
  }

  function renderComments (thread) {
    const commentsNode = document.createElement('div')
    for (const comment of thread.replies) {
      const renderedString = renderComment(comment)
      const htmlContent = createElementFromHTML(renderedString)

      htmlContent.querySelector('.replies').appendChild(renderComments(comment))

      commentsNode.appendChild(htmlContent)
    }

    return commentsNode
  }

  // https://stackoverflow.com/a/494348
  function createElementFromHTML (htmlString) {
    const div = document.createElement('div')
    div.innerHTML = htmlString.trim()
    return div.firstChild
  }

  function renderComment (comment) {
    const replyDate = new Date(comment.post.record.createdAt)

    return `<ul class="bluesky-comments">
  <li class="avatar">
    <img src="${comment.post.author.avatar}">
  </li>
  <li class="comment">
    <div class="author"><a href="https://bsky.app/profile/${comment.post.author.handle}" rel="ugc">
      <strong class="display-name">${comment.post.author.displayName}</strong>
      <span class="handle">@${comment.post.author.handle}</span></a>
      <a class="comment-link" href="${ToBskyUrl(comment.post.uri)}" rel="ugc"><span>${replyDate.toLocaleString()}</span></a>
    </a></div>
    <div>${comment.post.record.text}</div>
    <div class="icons">
      <!-- icons from https://www.systemuicons.com/ -->
        <a class="icon-link" href="${ToBskyUrl(comment.post.uri)}" rel="ugc">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                <path fill="none" stroke-linecap="round" stroke-linejoin="round" d="M11 16.517c4.418 0 8-3.284 8-7.017S15.418 3 11 3S3 6.026 3 9.759c0 1.457.546 2.807 1.475 3.91L3.5 18.25l3.916-2.447a9.2 9.2 0 0 0 3.584.714" />
            </svg>
            ${comment.post.replyCount}
        </a>

        <a class="icon-link" href="${ToBskyUrl(comment.post.uri)}" rel="ugc">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                <g fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m13.5 13.5l3 3l3-3" /><path d="M9.5 4.5h3a4 4 0 0 1 4 4v8m-9-9l-3-3l-3 3" /><path d="M11.5 16.5h-3a4 4 0 0 1-4-4v-8" />
                </g>
            </svg>
            ${comment.post.repostCount}
        </a>

        <a class="icon-link" href="${ToBskyUrl(comment.post.uri)}" rel="ugc">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                <path fill="none" stroke-linecap="round" stroke-linejoin="round" d="M10.5 6.5c.5-2.5 4.343-2.657 6-1c1.603 1.603 1.5 4.334 0 6l-6 6l-6-6a4.243 4.243 0 0 1 0-6c1.55-1.55 5.5-1.5 6 1" />
            </svg>
            ${comment.post.likeCount}
        </a>
    </div>
    <div class="replies"></div>
  </li>
</ul>`
  }
})(jQuery)
