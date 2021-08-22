import { Module } from "../types/module.type";

export interface IGenerate {

  generateLocaleData: (locale: string) => Promise<Module[]>

}