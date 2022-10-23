const {farenheitToCelsius, celsiusToFarenheit} = require('../src/math')

test('Should convert 32 F to 0 C', () => {
    const temp = farenheitToCelsius(32)
    expect(temp).toBe(0)
})

test('Should convert 0 C to 32 F', () => {
    const temp = celsiusToFarenheit(0)
    expect(temp).toBe(32)
})

