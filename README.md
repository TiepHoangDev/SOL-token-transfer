## Tranfer 1-1

```bash
node .\transfer1_1.js "erode lady picture gun critic injury middle promote motion begin zero fatal" "genius own blush winter together torch myth north depart auto practice frequent" "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr" 1 1
```

```csharp
var psi = new ProcessStartInfo
{
    FileName = "node",
    Arguments = $"transfer1_1.js \"{senderMnemonic}\" \"{receiverMnemonic}\" \"{mintAddress}\" {amount} {accountIndex}",
    RedirectStandardOutput = true,
    RedirectStandardError = true,
    UseShellExecute = false,
    CreateNoWindow = true
};
```

## Tranfer 1-N


```bash
node transfer1_n_file_wrapper.js
```

```csharp
using System.Diagnostics;

var psi = new ProcessStartInfo
{
    FileName = "node",
    Arguments = $"transfer1_n.js \"{escapedJson}\"",
    RedirectStandardOutput = true,
    RedirectStandardError = true,
    UseShellExecute = false,
    CreateNoWindow = true,
};

var process = new Process { StartInfo = psi };
process.Start();

string output = process.StandardOutput.ReadToEnd();
string error = process.StandardError.ReadToEnd();

process.WaitForExit();

if (process.ExitCode == 0)
{
    Console.WriteLine("✅ Transfer OK");
    Console.WriteLine(output);  // JSON kết quả từ transfer1_n.js
}
else
{
    Console.WriteLine("❌ Transfer lỗi");
    Console.WriteLine(error);
}
```