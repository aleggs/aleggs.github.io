const intro = document.querySelector<HTMLElement>('#intro')
const feed = document.querySelector<HTMLElement>('.substack-background')
const main = document.querySelector<HTMLElement>('main')

const introWidth = intro!.offsetWidth;
const feedWidth = feed!.offsetWidth;
if (feedWidth >= introWidth)
    main!.style.width = introWidth + 'px';
else
    main!.style.width = feedWidth + 'px';

main!.style.visibility = 'visible'
// const mainContent = document.querySelector<HTMLElement>('.main-content')
// mainContent!.style.display = 'flex'
