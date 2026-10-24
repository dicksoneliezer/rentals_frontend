import { useEffect, useRef } from 'react'
import SignaturePadLib from 'signature_pad'

/**
 * Signature capture on a canvas.
 *
 * Produces a trimmed PNG data URI via the same transparent-background technique
 * used for the printed receipt signature, so a signature drawn here looks
 * identical whether it is shown in the app, embedded in a downloaded document,
 * or printed.
 */
export default function SignaturePad({ onChange, disabled = false, label = 'Draw your signature' }) {
  const canvasRef = useRef(null)
  const padRef = useRef(null)
  const onChangeRef = useRef(onChange)

  // Keep the latest callback without tearing down the pad on every render.
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    canvas.getContext('2d').scale(ratio, ratio)

    const pad = new SignaturePadLib(canvas, {
      minWidth: 1.1,
      maxWidth: 2.6,
      penColor: '#0b1220',
    })
    padRef.current = pad

    const emit = () => {
      onChangeRef.current?.(pad.isEmpty() ? null : pad.toDataURL('image/png'))
    }
    const onEnd = () => emit()
    const onBegin = () => emit()

    pad.addEventListener('endStroke', onEnd)
    pad.addEventListener('beginStroke', onBegin)

    // Without this the bitmap is blank after a rotation or window resize.
    const handleResize = () => {
      const data = pad.toData()
      const wasEmpty = pad.isEmpty()
      const ratioNow = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratioNow
      canvas.height = canvas.offsetHeight * ratioNow
      canvas.getContext('2d').scale(ratioNow, ratioNow)
      pad.clear()
      if (!wasEmpty) pad.fromData(data)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      pad.off()
    }
  }, [])

  const clear = () => {
    padRef.current?.clear()
    onChangeRef.current?.(null)
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <button
          type="button"
          onClick={clear}
          disabled={disabled}
          className="text-xs text-blue-700 hover:underline disabled:opacity-40 disabled:no-underline"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        disabled={disabled}
        aria-label={label}
        className="block w-full h-40 touch-none cursor-crosshair bg-white"
        style={{ touchAction: 'none' }}
      />
      <div className="px-3 py-1.5 border-t border-gray-200 text-[11px] text-gray-500">
        Draw with a finger, stylus or mouse inside the box above.
      </div>
    </div>
  )
}