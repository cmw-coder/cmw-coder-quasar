import time
import json

# 等待20秒
time.sleep(20)

# 构造字典
result =  {
  "testSuccess":"False",
  "ErrorList": [{
    "testErrorInfo": "aaaaaaaaa",
    "codeSnippet": "aaaaaa",
    "suggest": "aaaaaaaaaaa",
    "fixCode": "aaaaaaaaaa"
  }]
}

# 将字典转换为JSON字符串
output = json.dumps(result, indent=4, ensure_ascii=False)

# 打印输出
print(output)
