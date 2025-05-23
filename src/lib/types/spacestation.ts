export interface CurrentSelectedPrice {
	[key: string]: string;
}

export interface History {
	price: number;
	date: string;
}

export interface Artifact {
	history: History[];
	name: string;
	price: number;
	date?: string[];
}

export interface StationData {
	name: string;
	artifacts: Artifact[];
}

export type SpaceStationResponse = {
	data: StationData[];
	error?: string;
};
