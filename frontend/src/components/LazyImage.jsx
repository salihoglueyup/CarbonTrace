import { useState, useEffect, useRef } from 'react'

const LazyImage = ({
    src,
    alt = '',
    placeholder = '',
    width,
    height,
    className = '',
    blur = true,
    threshold = 0.1,
    onLoad,
    onError
}) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const [error, setError] = useState(false)
    const imgRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            { threshold }
        )

        if (imgRef.current) {
            observer.observe(imgRef.current)
        }

        return () => observer.disconnect()
    }, [threshold])

    const handleLoad = () => {
        setIsLoaded(true)
        if (onLoad) onLoad()
    }

    const handleError = () => {
        setError(true)
        if (onError) onError()
    }

    // Generate placeholder blur
    const placeholderStyle = blur && !isLoaded ? {
        filter: 'blur(10px)',
        transform: 'scale(1.1)'
    } : {}

    return (
        <div
            ref={imgRef}
            className={`lazy-image-container ${className} ${isLoaded ? 'loaded' : ''}`}
            style={{ width, height }}
        >
            {/* Placeholder */}
            {!isLoaded && !error && (
                <div className="lazy-image-placeholder">
                    {placeholder ? (
                        <img
                            src={placeholder}
                            alt=""
                            style={placeholderStyle}
                        />
                    ) : (
                        <div className="lazy-image-skeleton">
                            <div className="shimmer"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Actual Image */}
            {isInView && !error && (
                <img
                    src={src}
                    alt={alt}
                    className={`lazy-image ${isLoaded ? 'visible' : ''}`}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}

            {/* Error State */}
            {error && (
                <div className="lazy-image-error">
                    <span>🖼️</span>
                    <p>Resim yüklenemedi</p>
                </div>
            )}
        </div>
    )
}

// ============================================
// IMAGE GALLERY WITH LAZY LOADING
// ============================================
export const LazyImageGallery = ({
    images = [],
    columns = 3,
    gap = 16,
    onImageClick
}) => {
    return (
        <div
            className="lazy-image-gallery"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap
            }}
        >
            {images.map((image, index) => (
                <LazyImage
                    key={index}
                    src={image.src}
                    alt={image.alt || `Image ${index + 1}`}
                    placeholder={image.thumbnail}
                    className="gallery-image"
                    onClick={() => onImageClick?.(image, index)}
                />
            ))}
        </div>
    )
}

export default LazyImage
