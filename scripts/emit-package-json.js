#!/usr/bin/env node
import { mkdirSync as makeDirectorySync, writeFileSync } from "fs"
import packageJson_ from "../package.json" with { type: "json" }

const /** @type {Partial<typeof packageJson_>} */ packageJson = packageJson_

delete packageJson.private
delete packageJson.devDependencies

makeDirectorySync("dist", { recursive: true })
writeFileSync("dist/package.json", JSON.stringify(packageJson))
process.exit()
