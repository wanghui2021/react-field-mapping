import FieldMapping from './fieldMapping';

export { FieldMapping };
export default FieldMapping;

if (typeof window !== 'undefined') {
  // expose for UMD/global usage when loaded directly in a browser
  (window as any).FieldMapping = FieldMapping;
}
