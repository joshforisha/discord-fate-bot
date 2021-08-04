export const AspectType = {
  Aspect: 'ASPECT',
  Boost: 'BOOST'
}

export function die () {
  return Math.floor(Math.random() * 3) - 1
}

export function fateDieEmoji (num) {
  if (num < 0) return ':arrow_down_small:'
  if (num > 0) return ':arrow_up_small:'
  return ':record_button:'
}

export function ratingText (score) {
  switch (score) {
    case -4:
      return 'Horrifying'
    case -3:
      return 'Catastrophic'
    case -2:
      return 'Terrible'
    case -1:
      return 'Poor'
    case 0:
      return 'Mediocre'
    case 1:
      return 'Average'
    case 2:
      return 'Fair'
    case 3:
      return 'Good'
    case 4:
      return 'Great'
    case 5:
      return 'Superb'
    case 6:
      return 'Fantastic'
    case 7:
      return 'Epic'
    case 8:
      return 'Legendary'
  }
}
