import { demoCalibrationService } from '../src/model-control/services/demoCalibrationService'

async function runTest() {
  console.log('--- 1. Testing Synthetic Signal Generation ---')
  const signal = demoCalibrationService.generateSyntheticHelloSignal(1, 600)
  console.log(`Generated ${signal.length} samples.`)
  if (signal.length !== 600) throw new Error('Expected 600 samples')
  console.log('Sample preview:', signal.slice(0, 5), '...', signal.slice(200, 205), '...', signal.slice(440, 445))

  console.log('\n--- 2. Testing Mathematical Feature Extraction ---')
  const features = demoCalibrationService.extractFeatures(signal)
  console.log('Extracted features:', features)
  if (features.rms <= 0 || features.mav <= 0 || features.zcr <= 0 || features.peakToPeak <= 0) {
    throw new Error('Feature extraction values are invalid')
  }

  console.log('\n--- 3. Testing 5-Trial Template Builder ---')
  const trialFeatures = [1, 2, 3, 4, 5].map((t) => {
    const s = demoCalibrationService.generateSyntheticHelloSignal(t, 600)
    return demoCalibrationService.extractFeatures(s)
  })
  const template = demoCalibrationService.buildTemplate(trialFeatures)
  console.log('Template created for:', template.command)
  console.log('Template mean features:', template.meanFeatures)
  console.log('Template std features:', template.stdFeatures)

  console.log('\n--- 4. Testing Independent Validation Sample (Trial 6) ---')
  const valSignal = demoCalibrationService.generateSyntheticHelloSignal(6, 600)
  const valFeatures = demoCalibrationService.extractFeatures(valSignal)
  const similarity = demoCalibrationService.computeSimilarity(valFeatures, template)
  console.log(`Validation similarity match: ${similarity}%`)
  if (similarity < 85 || similarity > 100) {
    throw new Error(`Similarity out of expected range [85, 100]: ${similarity}%`)
  }

  console.log('\n--- 5. Testing Simulated Inference Pipeline ---')
  // Initialize state so inference can run
  ;(demoCalibrationService as any).state.isCalibrated = true
  ;(demoCalibrationService as any).state.activeTemplate = template

  const inference = await demoCalibrationService.runDemoInference()
  console.log('Inference result:', inference)
  if (inference.command !== 'HELLO' || inference.confidence < 0.85) {
    throw new Error('Inference result unexpected')
  }

  console.log('\n✅ ALL SIMULATION AND CALIBRATION CHECKS PASSED!')
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
