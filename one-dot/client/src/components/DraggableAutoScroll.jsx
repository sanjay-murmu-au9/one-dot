import { useRef, useEffect } from 'react'

export default function DraggableAutoScroll({ 
  children, 
  direction = 'left', 
  speed = 1,
  className = "" 
}) {
  const containerRef = useRef(null)
  const isDown = useRef(false)
  const isHovered = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationFrameId

    // Move to the right edge immediately if scrolling right
    // This allows right-to-left scrolling to loop properly from the start.
    if (direction === 'right' && container.scrollLeft === 0) {
      container.scrollLeft = container.scrollWidth / 2
    }

    const scroll = () => {
      const halfWidth = container.scrollWidth / 2
      
      // Auto-scroll logic if not hovering or dragging
      if (!isDown.current && !isHovered.current) {
        if (direction === 'left') {
          container.scrollLeft += speed
          if (container.scrollLeft >= halfWidth) {
            container.scrollLeft -= halfWidth
          }
        } else {
          container.scrollLeft -= speed
          if (container.scrollLeft <= 0) {
            container.scrollLeft += halfWidth
          }
        }
      }
      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(animationFrameId)
  }, [direction, speed])

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    isDown.current = true
    const container = containerRef.current
    container.classList.add('cursor-grabbing')
    startX.current = e.pageX - container.offsetLeft
    scrollLeftStart.current = container.scrollLeft
  }

  const handleMouseLeave = () => {
    isDown.current = false
    isHovered.current = false
    const container = containerRef.current
    if (container) container.classList.remove('cursor-grabbing')
  }

  const handleMouseUp = () => {
    isDown.current = false
    const container = containerRef.current
    if (container) container.classList.remove('cursor-grabbing')
  }

  const handleMouseMove = (e) => {
    if (!isDown.current) return
    e.preventDefault()
    const container = containerRef.current
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX.current) * 2 // drag speed multiplier
    container.scrollLeft = scrollLeftStart.current - walk

    const halfWidth = container.scrollWidth / 2

    // Bound checking during manual drag to make it infinite
    if (direction === 'left') {
      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth
        startX.current = e.pageX - container.offsetLeft
        scrollLeftStart.current = container.scrollLeft
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += halfWidth
        startX.current = e.pageX - container.offsetLeft
        scrollLeftStart.current = container.scrollLeft
      }
    } else {
      if (container.scrollLeft <= 0) {
        container.scrollLeft += halfWidth
        startX.current = e.pageX - container.offsetLeft
        scrollLeftStart.current = container.scrollLeft
      } else if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth
        startX.current = e.pageX - container.offsetLeft
        scrollLeftStart.current = container.scrollLeft
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`flex overflow-x-auto hide-scrollbar cursor-grab py-8 ${className}`}
      style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="flex flex-shrink-0 gap-8 min-w-max pr-8">
        {children}
      </div>
      <div className="flex flex-shrink-0 gap-8 min-w-max">
        {children}
      </div>
    </div>
  )
}
