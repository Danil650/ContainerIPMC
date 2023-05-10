export default interface Substance {
    Id: string,
    SubstName?: string,
    CAS?: string,
    Meaning?: string,
    Mass: Number,
    UnitId: number
    Formula?: string,
    Investigated: string,
    Left: string,
    URL?: string,
    ContId? : string,
    SubsCreateDate? : Date,
    Passport : string,
}