// Documentos que cada dirigente debe entregar. `campo` es la casilla en Dirigente y `tipo` el valor de
// TipoDocumentoDirigente en el backend (endpoint /api/dirigentes/{id}/documentos/{tipo}).
export const DOCUMENTOS = [
  { campo: 'docAntecedentes', tipo: 'ANTECEDENTES', etiqueta: 'Certificado de antecedentes' },
  { campo: 'docInhabilidad', tipo: 'INHABILIDAD', etiqueta: 'Certificado de inhabilidades' },
  { campo: 'docCurriculum', tipo: 'CURRICULUM', etiqueta: 'Currículum' },
  { campo: 'docCurriculumScout', tipo: 'CURRICULUM_SCOUT', etiqueta: 'Currículum scout' },
  { campo: 'docNacimiento', tipo: 'NACIMIENTO', etiqueta: 'Certificado de nacimiento' },
];

export const faltantes = (dirigente) => DOCUMENTOS.filter((doc) => !dirigente[doc.campo]);
