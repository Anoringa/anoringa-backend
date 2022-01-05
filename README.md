# Anoringa Backend
the rest api service of anoringa


heroku logs --tail --app app_id

based on:
https://github.com/maitraysuthar/rest-api-nodejs-mongodb




requeriments:
- node v14
    
    
recommendations:
- use [nodist](https://chocolatey.org/install#individual) to manage node versions
  - requeriments [chocolatey](https://chocolatey.org/install#individual)

```Powershell
# setup windows scripting policys
Set-ExecutionPolicy -Scope LocalMachine -ExecutionPolicy Unrestricted

# install nodist using chocolatey
choco install nodist

# Reload ENV
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
C:\ProgramData\chocolatey\bin\RefreshEnv.cmd

# setup node 14 and npm with nodist
nodist + 14
nodist global 14
nodist npm global match


# check node and npm version
node -v
npm -v

# solve cache issues deleting cached files
npm cache clean --force
rm  node_modules
```


run the demo
```Powershell
npm run nodemonserve
```
