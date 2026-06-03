/**
 * 互換用シム。旧 V2Card のエクスポートは V2Cards へ統合された。
 * 既存の import を壊さないようここから再エクスポートする。
 */
export {
  V2SpotCardV as V2SpotCard,
  V2SpotRow as V2ListCard,
  V2FeatureCardV as V2FeatureCard,
} from './V2Cards';
