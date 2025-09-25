// --- Seamless Fence Scroller Logic ---

function setupFenceScroller(fenceContainer, speed, direction) {
    const content = fenceContainer.querySelector('.fence-content');
    if (!content) return;

    // 1. Clone the content for a seamless loop
    const contentClone = content.cloneNode(true);
    fenceContainer.appendChild(contentClone);

    let scrollAmount = 0;
    const contentWidth = content.offsetWidth;

    function animate() {
        // 2. Increment the scroll amount
        scrollAmount += speed;

        // 3. Reset scroll amount when it completes a cycle
        if (scrollAmount >= contentWidth) {
            scrollAmount = 0;
        }

        // 4. Apply the transform based on direction
        if (direction === 'left') {
            content.style.transform = `translateX(-${scrollAmount}px)`;
            contentClone.style.transform = `translateX(-${scrollAmount}px)`;
        } else { // direction === 'right'
            const initialOffset = -contentWidth;
            content.style.transform = `translateX(${initialOffset + scrollAmount}px)`;
            contentClone.style.transform = `translateX(${initialOffset + scrollAmount}px)`;
        }

        // 5. Loop the animation smoothly
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
}

// Initialize the scrollers
const topFence = document.querySelector('.fence-top');
const bottomFence = document.querySelector('.fence-bottom');

if (topFence) {
    setupFenceScroller(topFence, 0.5, 'left');
}
if (bottomFence) {
    setupFenceScroller(bottomFence, 0.5, 'right');
}

// --- Console log for page load ---
console.log("Discovery page loaded with seamless animations! 🗺️");