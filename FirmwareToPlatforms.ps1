Param
(
	[string]$platforms = ""
)

$PATH_PLATFORMS = $platforms

if (!$PATH_PLATFORMS)
{
	"Error: platforms directory not specified"
	exit
}

$firmwareItems = Get-ChildItem *.* -include *.bin

foreach ($firmware in $firmwareItems)
{
	$isFound = $firmware.Name -match "-(.*?)-"

	if ($isFound)
	{
		$platformName = $matches[1]

		$platformFolder = Get-ChildItem $PATH_PLATFORMS | Where-Object { ($_.PSIsContainer -eq $true) -and ($_.Name -like $platformName) }

		if ($platformFolder)
		{
			$platformFirmwareFolder = $platformFolder.FullName + "\firmware\"

			md -Path $platformFirmwareFolder -force | Out-Null

			Copy-Item $firmware.FullName ($platformFirmwareFolder + $firmware.Name)

			"Copied '" + $firmware.Name + "' to '" + $platformFirmwareFolder + "'"
		}
	}
	else
	{
		"Unknown firmware '" + $firmware.Name + "'"
	}
}