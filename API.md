# API Reference <a name="API Reference" id="api-reference"></a>



## Classes <a name="Classes" id="Classes"></a>

### AwsCdkSSMResolver <a name="AwsCdkSSMResolver" id="@vincentgna/cdk8s-ssm-resolver.AwsCdkSSMResolver"></a>

- *Implements:* cdk8s.IResolver

#### Initializers <a name="Initializers" id="@vincentgna/cdk8s-ssm-resolver.AwsCdkSSMResolver.Initializer"></a>

```typescript
import { AwsCdkSSMResolver } from '@vincentgna/cdk8s-ssm-resolver'

new AwsCdkSSMResolver()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@vincentgna/cdk8s-ssm-resolver.AwsCdkSSMResolver.resolve">resolve</a></code> | lookup table to reverse lookup ssm stringValue token to ssm parameterName. |

---

##### `resolve` <a name="resolve" id="@vincentgna/cdk8s-ssm-resolver.AwsCdkSSMResolver.resolve"></a>

```typescript
public resolve(context: ResolutionContext): void
```

lookup table to reverse lookup ssm stringValue token to ssm parameterName.

###### `context`<sup>Required</sup> <a name="context" id="@vincentgna/cdk8s-ssm-resolver.AwsCdkSSMResolver.resolve.parameter.context"></a>

- *Type:* cdk8s.ResolutionContext

---




### SSMProducer <a name="SSMProducer" id="@vincentgna/cdk8s-ssm-resolver.SSMProducer"></a>

- *Implements:* cdk8s.IAnyProducer

#### Initializers <a name="Initializers" id="@vincentgna/cdk8s-ssm-resolver.SSMProducer.Initializer"></a>

```typescript
import { SSMProducer } from '@vincentgna/cdk8s-ssm-resolver'

new SSMProducer(name: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@vincentgna/cdk8s-ssm-resolver.SSMProducer.Initializer.parameter.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `name`<sup>Required</sup> <a name="name" id="@vincentgna/cdk8s-ssm-resolver.SSMProducer.Initializer.parameter.name"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@vincentgna/cdk8s-ssm-resolver.SSMProducer.produce">produce</a></code> | *No description.* |

---

##### `produce` <a name="produce" id="@vincentgna/cdk8s-ssm-resolver.SSMProducer.produce"></a>

```typescript
public produce(): any
```


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@vincentgna/cdk8s-ssm-resolver.SSMProducer.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `name`<sup>Required</sup> <a name="name" id="@vincentgna/cdk8s-ssm-resolver.SSMProducer.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---



